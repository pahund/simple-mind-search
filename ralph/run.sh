#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

for ((i=1; i<=$1; i++)); do
  echo "------------------------------"
  echo "Iteration $i - $(date '+%Y-%m-%d %H:%M:%S')"
  claude --permission-mode acceptEdits -p "$(cat /home/dev/workspace/ralph/iteration.txt)" | tee /tmp/claude_output.txt
  result=$(cat /tmp/claude_output.txt)
  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "All tasks finished, Feierabend! - $(date '+%Y-%m-%d %H:%M:%S')"
    exit 0
  fi
done