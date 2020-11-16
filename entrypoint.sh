#!/bin/bash
npm run copy-default

until channelsCount=`mongo vtapi-mongo/data --quiet --eval="db.channels.count()"`; do
    >&2 echo "Mongo is unavailable - sleeping"
    sleep 1
done
videosCount=`mongo vtapi-mongo/data --quiet --eval="db.videos.count()"`

# Run init script only once
if (( channelsCount==0 && videosCount==0 )); then
    echo "Run init script"
    npm run init
fi
npm start