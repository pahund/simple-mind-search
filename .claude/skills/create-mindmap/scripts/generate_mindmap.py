#!/usr/bin/env python3
"""
SimpleMind Mindmap Generator
Creates .smmx files (SimpleMind Pro mindmap format) from JSON node structures.
"""

import argparse
import json
import math
import os
import sys
import uuid
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


def generate_guid():
    """Generate a unique GUID for SimpleMind topics."""
    # SimpleMind uses base64-like GUIDs
    return uuid.uuid4().hex[:22]


def calculate_positions(nodes):
    """
    Calculate x,y positions for all nodes using radial layout.

    Root is centered at (400, 400).
    Children are positioned in circles around their parent.
    """
    positions = {}

    # Find root node
    root_nodes = [n for n in nodes if n.get('parent') is None]
    if not root_nodes:
        raise ValueError("No root node found (node with parent=null)")
    if len(root_nodes) > 1:
        raise ValueError(f"Multiple root nodes found: {[n['id'] for n in root_nodes]}")

    root = root_nodes[0]
    positions[root['id']] = (400.0, 400.0)

    # Group nodes by parent
    children_by_parent = {}
    for node in nodes:
        parent_id = node.get('parent')
        if parent_id:
            children_by_parent.setdefault(parent_id, []).append(node)

    # Recursively position children in circles around parents
    def position_children(parent_id, level=1):
        if parent_id not in children_by_parent:
            return

        children = children_by_parent[parent_id]
        px, py = positions[parent_id]
        radius = 250 * level
        angle_step = 360 / len(children)

        for i, child in enumerate(children):
            angle = math.radians(i * angle_step)
            x = px + radius * math.cos(angle)
            y = py + radius * math.sin(angle)
            positions[child['id']] = (round(x, 2), round(y, 2))
            position_children(child['id'], level + 1)

    position_children(root['id'])
    return positions


def build_xml(nodes, title, positions):
    """Build SimpleMind XML structure from nodes."""

    # Create root element
    root = ET.Element('simplemind-mindmaps', {
        'doc-version': '3',
        'generator': 'ClaudeCode',
        'gen-version': '1.0.0'
    })

    # Create mindmap element
    mindmap = ET.SubElement(root, 'mindmap')

    # Add metadata
    meta = ET.SubElement(mindmap, 'meta')
    ET.SubElement(meta, 'guid', {'guid': generate_guid()})
    ET.SubElement(meta, 'title', {'text': title})
    ET.SubElement(meta, 'images', {'containsImages': 'false'})
    ET.SubElement(meta, 'style', {'key': 'default'})
    ET.SubElement(meta, 'auto-numbering', {'style': 'disabled'})
    ET.SubElement(meta, 'scrollstate', {'zoom': '100', 'x': '0', 'y': '0'})
    ET.SubElement(meta, 'main-centraltheme', {'id': '0'})

    # Create topics section
    topics = ET.SubElement(mindmap, 'topics')

    # Create ID mapping for parent references
    id_to_index = {}
    root_node = [n for n in nodes if n.get('parent') is None][0]

    # Assign numeric IDs starting from 0 for root
    for idx, node in enumerate(nodes):
        if node['id'] == root_node['id']:
            id_to_index[node['id']] = 0
            break

    # Assign IDs to other nodes
    current_id = 1
    for node in nodes:
        if node['id'] != root_node['id']:
            id_to_index[node['id']] = current_id
            current_id += 1

    # Sort nodes so root comes first
    sorted_nodes = sorted(nodes, key=lambda n: id_to_index[n['id']])

    # Create topic elements
    for node in sorted_nodes:
        node_id = id_to_index[node['id']]
        parent_id = -1 if node.get('parent') is None else id_to_index[node['parent']]
        x, y = positions[node['id']]

        topic_attrs = {
            'id': str(node_id),
            'parent': str(parent_id),
            'guid': generate_guid(),
            'x': f'{x:.2f}',
            'y': f'{y:.2f}',
            'text': node['text'],
            'textfmt': 'plain'
        }

        # Add checkbox attributes if done status is specified
        if 'done' in node:
            topic_attrs['checkbox-mode'] = 'checkbox'
            topic_attrs['checkbox'] = 'true'
            if node['done']:
                topic_attrs['checked'] = 'true'
                topic_attrs['progress'] = '100'
            else:
                topic_attrs['progress'] = '0'

        topic = ET.SubElement(topics, 'topic', topic_attrs)

        # Add layout for root node
        if parent_id == -1:
            ET.SubElement(topic, 'layout', {
                'mode': 'free',
                'direction': 'manual',
                'flow': 'default'
            })

        # Add URL if present
        if 'url' in node and node['url']:
            ET.SubElement(topic, 'link', {'urllink': node['url']})

        # Add notes if present
        if 'notes' in node and node['notes']:
            children = ET.SubElement(topic, 'children')
            for idx, note in enumerate(node['notes']):
                y_offset = -60.0 - (idx * 40.0)
                text_elem = ET.SubElement(children, 'text', {
                    'guid': generate_guid(),
                    'x': '0.00',
                    'y': f'{y_offset:.2f}'
                })
                ET.SubElement(text_elem, 'note', {'textfmt': 'plain'}).text = note

    # Add empty relations and node-groups
    ET.SubElement(mindmap, 'relations')
    ET.SubElement(mindmap, 'node-groups')

    # Add basic stylesheet
    stylesheet = ET.SubElement(mindmap, 'stylesheet')
    general = ET.SubElement(stylesheet, 'general', {
        'description': 'default',
        'levelbased': 'true'
    })
    ET.SubElement(general, 'bkgnd-color', {'r': '255', 'g': '255', 'b': '255'})
    ET.SubElement(general, 'font-color', {'r': '0', 'g': '0', 'b': '0'})

    return root


def create_smmx(xml_tree, output_path):
    """Create .smmx ZIP archive with mindmap XML."""

    # Ensure output directory exists
    output_dir = os.path.dirname(output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)

    # Generate XML string with proper formatting
    ET.indent(xml_tree, space='    ')
    xml_string = ET.tostring(xml_tree, encoding='unicode', xml_declaration=False)

    # Add XML declaration and DOCTYPE
    full_xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE simplemind-mindmaps>

{xml_string}
'''

    # Create ZIP archive
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipf.writestr('document/mindmap.xml', full_xml)

    return output_path


def validate_nodes(nodes):
    """Validate node structure and check for issues."""

    if not nodes:
        raise ValueError("Nodes list is empty")

    # Check for required fields
    for node in nodes:
        if 'id' not in node:
            raise ValueError(f"Node missing 'id' field: {node}")
        if 'text' not in node:
            raise ValueError(f"Node missing 'text' field: {node}")
        if 'parent' not in node:
            raise ValueError(f"Node missing 'parent' field: {node}")

    # Check for duplicate IDs
    ids = [n['id'] for n in nodes]
    if len(ids) != len(set(ids)):
        duplicates = [id for id in ids if ids.count(id) > 1]
        raise ValueError(f"Duplicate node IDs found: {set(duplicates)}")

    # Check parent references
    id_set = set(ids)
    for node in nodes:
        parent = node.get('parent')
        if parent is not None and parent not in id_set:
            raise ValueError(f"Node '{node['id']}' references non-existent parent '{parent}'")

    # Check for circular references (simple check)
    def has_circular_ref(node_id, visited=None):
        if visited is None:
            visited = set()
        if node_id in visited:
            return True
        visited.add(node_id)

        node = next((n for n in nodes if n['id'] == node_id), None)
        if node and node.get('parent'):
            return has_circular_ref(node['parent'], visited)
        return False

    for node in nodes:
        if has_circular_ref(node['id']):
            raise ValueError(f"Circular parent reference detected involving node '{node['id']}'")


def parse_arguments():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description='Generate SimpleMind Pro mindmap files (.smmx) from JSON node structures.'
    )
    parser.add_argument(
        '--title',
        required=True,
        help='Title for the mindmap'
    )
    parser.add_argument(
        '--output',
        required=True,
        help='Output path for .smmx file (e.g., ./mindmaps/my-map.smmx)'
    )
    parser.add_argument(
        '--json',
        help='JSON string containing nodes structure (or read from stdin if not provided)'
    )

    return parser.parse_args()


def main():
    """Main entry point."""
    try:
        args = parse_arguments()

        # Read JSON input
        if args.json:
            data = json.loads(args.json)
        else:
            # Read from stdin
            data = json.load(sys.stdin)

        # Extract and validate nodes
        if 'nodes' not in data:
            raise ValueError("JSON must contain 'nodes' array")

        nodes = data['nodes']
        validate_nodes(nodes)

        # Calculate positions
        positions = calculate_positions(nodes)

        # Build XML
        xml_tree = build_xml(nodes, args.title, positions)

        # Create .smmx file
        output_path = create_smmx(xml_tree, args.output)

        print(f"Successfully created mindmap: {output_path}")

    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)
    except ValueError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
