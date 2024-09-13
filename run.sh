#!/bin/sh
DIR="$( cd "$( dirname "$0" )" && pwd )"
BITCOINDIR=/bitcoin

copy_local_env() {
    cp ${DIR}/../.testnets/bitcoin/.env ${DIR}/.env
    # On macos use -i '' instead of -i
    sed -i '' 's|BITCOIN_HOST=.*|BITCOIN_HOST=localhost|g' ".env"
    sed -i '' 's|MEMPOOL_URL=.*|MEMPOOL_URL=http://localhost:8999/api|g' ".env"
}

copy_env() {
    if [ -f ${BITCOINDIR}/.env ]; then
        cp ${BITCOINDIR}/.env ${DIR}/.env
    else
        copy_local_env
    fi
}

bonding() {
    copy_env
    npm run bonding
}

$@