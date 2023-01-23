// import {stringToBytes} from 'convert-string';
import React, {useEffect, useState} from 'react';
import {
  Button,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
  Text,
  View,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleEmitter = new NativeEventEmitter(BleManagerModule);
// const Buffer = require('buffer').Buffer;

const Home = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [list, setList] = useState([]);
  const peripherals = new Map();

  const startScan = async () => {
    if (isScanning) return;

    peripherals.clear();

    setList(Array.from(peripherals.values()));

    const duration = 3;
    try {
      const data = await BleManager.scan([], duration, true);
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDiscover = peripheral => {
    console.log('New ', peripheral);

    if (!peripheral.name) peripheral.name = 'No Name';

    peripherals.set(peripheral.id, peripheral);

    setList(Array.from(peripherals.values()));
  };

  const handleStopScan = () => {
    console.log('Scan stopped');
    setIsScanning(false);
  };

  const handleDisconnect = data => {
    console.log('Disconnected from ', data.peripheral);

    let peripheral = peripherals.get(data.peripheral);

    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      setList(Array.from(peripherals.values()));
    }
  };

  const handleUpdates = data => {
    console.log(
      'Recieved from :' + data.peripheral,
      'Characteristics : ' + data.Characteristic,
      'Data : ' + data.value,
    );
  };

  const getPermissions = async () => {
    PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ).then(r1 => {
      if (r1) {
        console.log('checking ACCESS_FINE_LOCATION');
        return;
      }

      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then(r2 => {
        if (r2) {
          console.log('ACCESS_FINE_LOCATION granted');
          return;
        }
        console.log('Denied ACCESS_FINE_LOCATION');
      });
    });

    PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ).then(r1 => {
      if (r1) {
        console.log('checking BLUETOOTH_CONNECT');
        return;
      }

      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ).then(r2 => {
        if (r2) {
          console.log('BLUETOOTH_CONNECT granted');
          return;
        }
        console.log('Denied BLUETOOTH_CONNECT');
      });
    });

    PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    ).then(r1 => {
      if (r1) {
        console.log('checking ACCESS_FINE_LOCATION');
        return;
      }

      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      ).then(r2 => {
        if (r2) {
          console.log('BLUETOOTH_SCAN granted');
          return;
        }
        console.log('Denied BLUETOOTH_SCAN');
      });
    });
  };

  useEffect(() => {
    console.log('Home mounted');
    BleManager.start({showAlert: true});

    bleEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscover);
    bleEmitter.addListener('BleManagerStopScan', handleStopScan);
    bleEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnect);
    bleEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      handleUpdates,
    );

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      getPermissions();
    }
    return () => {
      console.log('Unmount');
      bleEmitter.removeAllListeners();
    };
  }, []);

  return (
    <View>
      <Button title="Start Scan" onPress={startScan} />
      {list.length === 0 && <Text>No peripherals</Text>}
      {list.map(data => {
        console.log(data);
        return <Text>Hello</Text>;
      })}
    </View>
  );
};

export default Home;
