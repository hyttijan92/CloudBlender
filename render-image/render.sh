#!/bin/bash
cd /app
echo "Running blender"
blender -b blender_file.blend -x 1 -o renders/images__ -E CYCLES -s $1 -e $2 -a
zip images.zip renders/*.png
echo "Running done"