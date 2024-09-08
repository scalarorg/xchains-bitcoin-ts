#!/bin/sh

copy_env() {
    cp ../.testnets/bitcoin/.env .env
    # On macos use -i '' instead of -i
    sed -i '' 's|BITCOIN_HOST=.*|BITCOIN_HOST=localhost|g' ".env"
    sed -i '' 's|MEMPOOL_URL=.*|MEMPOOL_URL=http://localhost:8999/api|g' ".env"
}

bonding() {
    copy_env
    npm run bonding
}

$@