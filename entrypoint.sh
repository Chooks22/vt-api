#!/bin/bash
LONGOPTS=(animare,hanayori,hololive,honeystrap,nijisanji,noripro,others,react,sugarlyric,vapart,vivid)
PROG=`basename $0`
PARSED=`getopt -o h -l $LONGOPTS -n $PROG -- "$@"`
[ $? -ne 0 ] && { echo; usage_and_exit; }
eval set -- "${PARSED}"

usage_and_exit() {
    cat << EOF
Usage: entrypoint.sh
description: Copy group json files
EOF
    exit 1
}

while true; do
    case "$1" in
        --animare|--hanayori|--hololive|--honeystrap|--nijisanji|--noripro|--others|--react|--sugarlyric|--vapart|--vivid)
            cp -v channels/default/${1#*--}.json channels/
            shift
            ;;
        --)
            shift
            break
            ;;
        -h|*)
            usage_and_exit
            exit 1
            ;;
    esac
done

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