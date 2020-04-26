if [[ $1 == "blockchain" ]]
then
  peer channel getinfo -c mychannel >> channelinfo.txt
elif [[ $1 == "block" && $2 != "" ]]
then
  peer channel fetch $2 -c mychannel
else
  echo "ERROR! Provide appropriate parameter."
fi