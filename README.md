# Cloud blender

* Allows uploading blender files to application, which are rendered in the cloud
* After rendering user can download the zip file, which contains renders

### Instructions
* To run the application:
    * Run script start.sh inside root folder
    OR
    * inside render-image: docker build -t render-image .
    * inside root folder: docker compose up
* After this go to localhost:7800/

The render-image uses blender version 3.3, which means, that blender files, which have been created with newer versions of blender might not be supported.

example_blender_files contains blender files, which can be used for testing

### Further improvements:
* Support for Eevee
* Opportunity to adjust render samples. Currently user has to change these in their blender file manually.
