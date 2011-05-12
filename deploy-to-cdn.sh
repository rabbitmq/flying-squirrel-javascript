#!/bin/sh

CONFIG=$PWD/s3cmd.cfg

# Sets BUCKET and CFURL.
. deploy-config.sh

if [ ! -e "$CONFIG" ]; then
	echo " [!] Can't find s3cmd config in $CONFIG"
	exit 1
fi

FILENAMES="./lib/flyingsquirrel-client.js ./lib/flyingsquirrel-api.js"

for FILENAME in $FILENAMES; do
	VERSION=`cat VERSION`

	VERFILE=`basename $FILENAME .js`-$VERSION.js
	cp $FILENAME /tmp/$VERFILE

	PRESENT=`s3cmd --config=$CONFIG ls s3://$BUCKET/$VERFILE|wc -l`
	if [ "$PRESENT" = "0" ]; then
		echo " [*] Uploading $VERFILE"
		s3cmd --config=$CONFIG put --guess-mime-type --acl-public /tmp/$VERFILE s3://$BUCKET
		R=$?
		if [ "$R" != "0" ]; then
			echo " [!] Upload failed (status=$R)"
			exit 1
		fi
	else
		echo " [!] File already exists. Can't overwrite - Cloudfront may not be in sync."
		echo " [!] If you really want you can delete it manually:"
		echo " [!] s3cmd --config=$CONFIG del s3://$BUCKET/$VERFILE"
		exit 1
	fi

	SUM1=`curl -s http://$CFURL/$VERFILE|md5sum`
	SUM2=`cat /tmp/$VERFILE|md5sum`

	if [ "$SUM1" = "$SUM2" ]; then
		echo " [.] Remote file matches local one."
	else
		echo " [!] Checksums don't match $SUM1 /= $SUM2"
		exit 1
	fi
	rm /tmp/$VERFILE
done

