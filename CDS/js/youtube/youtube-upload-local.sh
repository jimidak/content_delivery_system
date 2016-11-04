#Fill in the environmental variables to run the youtube upload script locally
#The credentials needed to run the script are stored in s3.
#It contains files containing the private key and the client secrets. You need to
#download these files and provide paths to them here. The passphrase variable is also stored here.
#!/bin/bash -e
cd "${0%/*}"
data_store="/tmp/test.db"
if [ -f $data_store ]; then
    rm $data_store
fi
cd ../..
export "cf_datastore_location"=$data_store;
./cds_create_datastore.pl
./cds_datastore.pl set meta key value
export "cf_media_file"="";
export "client_secrets"="";
export "title"="";
export "description"="";
export "category_id"="";
export "access"="";
export "owner_account"="";
export "owner_channel"="";
export "passphrase"="";
export "private_key"="";
node ./scripts/youtube-upload.js