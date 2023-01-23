import React, {useEffect, useState} from 'react';
import {PermissionsAndroid, Platform, Text, View} from 'react-native';
import {BleManager} from 'react-native-ble-plx';

const manager = new BleManager();

//REFER THESE
// https://github.com/dotintent/react-native-ble-plx/wiki/Characteristic-Reading
// https://github.com/dotintent/react-native-ble-plx/wiki/Characteristic-Reading

const Ble_Plx = () => {
  // const [devices, setDevices] = useState([]);
  const scanDevices = async () => {
    stopScan();
    manager.startDeviceScan(null, null, (error, device) => {
      console.log(JSON.stringify(device?.id));
      //         device.readCharacteristicForService(
      //   serviceUUID: UUID,
      //   characteristicUUID: UUID,
      //   transactionId: ?TransactionId
      // ): Promise<Characteristic>
    });
  };

  const stopScan = () => {
    setTimeout(() => {
      manager.stopDeviceScan();
    }, 5000);
  };

  // const connectDevice = async device => {

  // };

  useEffect(() => {
    // check location permission only for android device
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ])
        .then(result => {
          if (
            result['android.permission.ACCESS_FINE_LOCATION'] &&
            result['android.permission.BLUETOOTH_CONNECT'] &&
            result['android.permission.BLUETOOTH_SCAN']
          ) {
            console.log('All permissions granted');
          }
        })
        .catch(err => {
          console.log(err);
        });
    }

    scanDevices();
  }, []);

  return (
    <View>
      <Text>Ble plx</Text>
    </View>
  );
};

export default Ble_Plx;
