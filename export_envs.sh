#!/bin/zsh

function export_vars() {
    while read -r line || [[ -n $line ]]; do
        export "$line";
    done < $1
}

# Let's first export all of the default env variables
export_vars "config/.env"

if [ "$NODE_ENV" = "development" ]; then
    echo "Development"
    local f=config/development/.env
    if [ -r "$f" ]; then
        export_vars "$f"
    else
        echo "$f doesn't exist"
    fi
elif [ "$NODE_ENV" = "production" ]; then
    echo "Production"
    local f=config/production/.env
    if [ -r "$f" ]; then
        export_vars "$f"
    else
        echo "$f doesn't exist"
    fi
fi

