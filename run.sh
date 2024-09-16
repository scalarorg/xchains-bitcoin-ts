#!/bin/sh
DIR="$( cd "$( dirname "$0" )" && pwd )"
BITCOINDIR=/bitcoin

copy_local_env() {
    NETWORK=$1
    cp ${DIR}/../.testnets/bitcoin/.env ${DIR}/.env
    # On macos use -i '' instead of -i
    sed -i '' 's|BITCOIN_HOST=.*|BITCOIN_HOST=localhost|g' ".env"
    sed -i '' 's|MEMPOOL_URL=.*|MEMPOOL_URL=http://localhost:8999/api|g' ".env"
    SERVICE_CONTRACT=$(jq -r '.mintContract' ${DIR}/../.testnets/chains/${NETWORK}/addresses.json)
    sed -i '' "s|DEST_SMART_CONTRACT_ADDRESS=.*|DEST_SMART_CONTRACT_ADDRESS=${SERVICE_CONTRACT}|g" ".env"
}

copy_env() {
    NETWORK=$1
    if [ -f ${BITCOINDIR}/.env ]; then
        cp ${BITCOINDIR}/.env ${DIR}/.env
    else
        copy_local_env $NETWORK
    fi
}

bonding() {
    NETWORK=${1:-ethereum-local}
    copy_env $NETWORK
    npm run bonding
}

$@