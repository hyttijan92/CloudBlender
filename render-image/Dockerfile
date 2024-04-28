FROM ubuntu:22.04
RUN apt update 
RUN apt install -y wget xz-utils libx11-dev libxi6 libxxf86vm-dev libxfixes-dev libxrender1 libgl1-mesa-glx zip
WORKDIR /app
COPY render.sh /app/render.sh
RUN wget https://ftp.halifax.rwth-aachen.de/blender/release/Blender3.3/blender-3.3.1-linux-x64.tar.xz 
RUN tar -xvf blender-3.3.1-linux-x64.tar.xz --strip-components=1 -C /bin && rm -rf blender-3.3.1-linux-x64.tar.xz
RUN mkdir -p /app/renders/
RUN chmod +x *.sh
RUN adduser user --disabled-password
RUN chown -R user:users /app
USER user
ENTRYPOINT [ "./render.sh" ]
CMD ["1","1","CYCLES"]