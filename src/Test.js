/**
 * Sample BLE React Native App
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import {
  Button,
  FlatList,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

// import and setup react-native-ble-manager
import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleEmitter = new NativeEventEmitter(BleManagerModule);

// import stringToBytes from convert-string package.
// this func is useful for making string-to-bytes conversion easier
// import {stringToBytes} from 'convert-string';

// import Buffer function.
// this func is useful for making bytes-to-string conversion easier
// const Buffer = require('buffer/').Buffer;

const Test = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [deviceList, setDeviceList] = useState(null);

  const checkBondedDevices = async () => {
    const bondedDevices = await BleManager.getBondedPeripherals();
    console.log(bondedDevices);
    return bondedDevices;
  };

  // start to scan peripherals
  const startScan = async () => {
    // skip if scan process is currenly happening
    if (isScanning) {
      return;
    }

    const bondedDevices = await checkBondedDevices();

    // first, clear existing peripherals
    bondedDevices.length === 0
      ? setDeviceList([])
      : setDeviceList(bondedDevices);
  };

  // handle stop scan event
  const handleStopScan = () => {
    console.log('Scan is stopped');
    setIsScanning(false);
  };

  // handle disconnected peripheral
  const handleDisconnectedPeripheral = data => {
    console.log('Disconnected from ' + data.peripheral);
  };

  // handle update value for characteristic
  const handleUpdateValueForCharacteristic = data => {
    console.log(
      'Received data from: ' + data.peripheral,
      'Characteristic: ' + data.characteristic,
      'Data: ' + data.value,
    );
    console.log(data);
  };

  // update stored peripherals
  const updatePeripheral = (peripheral, callback) => {};

  // get advertised peripheral local name (if exists). default to peripheral name
  const getPeripheralName = item => {
    if (item.advertising) {
      if (item.advertising.localName) {
        return item.advertising.localName;
      }
    }

    return item.name;
  };

  // connect to peripheral then test the communication
  const connectAndTestPeripheral = peripheral => {
    if (!peripheral) {
      return;
    }

    console.log(peripheral.id);
    // connect to selected peripheral
    BleManager.connect(peripheral.id)
      .then(() => {
        console.log('ionside connect');
        console.log('Connected to ' + peripheral.id, peripheral);

        // update connected attribute
        updatePeripheral(peripheral, p => {
          p.connected = true;
          return p;
        });

        // retrieve peripheral services info
        BleManager.retrieveServices(peripheral.id).then(peripheralInfo => {
          console.log('Retrieved peripheral services', peripheralInfo);

          // test read current peripheral RSSI value
          BleManager.readRSSI(peripheral.id)
            .then(rssi => {
              console.log('Retrieved actual RSSI value', rssi);

              // update rssi value
              updatePeripheral(peripheral, p => {
                p.rssi = rssi;
                return p;
              });
            })
            .catch(err => console.log(err));

          console.log('peripheral id:', peripheral.id);

          // test read and write data to peripheral
          //   const serviceUUID = '10000000-0000-0000-0000-000000000001';
          //   const charasteristicUUID = '20000000-0000-0000-0000-000000000001';

          //   console.log('service:', serviceUUID);
          //   console.log('characteristic:', charasteristicUUID);
        });
      })
      .catch(error => {
        console.log('Connection error', error);
      });
  };

  const enableBluetooth = () => {
    BleManager.enableBluetooth()
      .then(() => {
        console.log('Bluetooth enabled');
        setIsBluetoothEnabled(true);
      })
      .catch(() => {
        console.warn('Turn on bluetooth');
        setIsBluetoothEnabled(false);
      });
  };

  // mount and onmount event handler
  useEffect(() => {
    console.log('Mount');

    // initialize BLE modules
    BleManager.start({showAlert: false});

    enableBluetooth();

    if (!isBluetoothEnabled) return;
    bleEmitter.addListener('BleManagerStopScan', handleStopScan);
    bleEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      handleDisconnectedPeripheral,
    );
    bleEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      handleUpdateValueForCharacteristic,
    );

    // check location permission only for android device
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]).then(result => {
        if (
          result['android.permission.ACCESS_FINE_LOCATION'] &&
          result['android.permission.BLUETOOTH_CONNECT'] &&
          result['android.permission.BLUETOOTH_SCAN']
        ) {
          console.log('All permissions granted');
        }
      });
    }

    // remove ble listeners on unmount
    return () => {
      console.log('Unmount');

      bleEmitter.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // render list of devices
  const renderItem = item => {
    return (
      <TouchableHighlight onPress={() => connectAndTestPeripheral(item)}>
        <View
          style={[
            styles.row,
            {backgroundColor: item.connected ? 'green' : '#fff'},
          ]}>
          <Text style={styles.name}>{getPeripheralName(item)}</Text>
          <Text style={styles.rssi}>RSSI: {item.rssi}</Text>
          <Text style={styles.id}>{item.id}</Text>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <View style={styles.safeAreaView}>
      {isBluetoothEnabled ? (
        <>
          <View style={styles.body}>
            <View style={styles.scanButton}>
              <Button
                title={'Scan Bluetooth Devices'}
                onPress={() => startScan()}
              />
            </View>

            {deviceList?.length === 0 ? (
              <View style={styles.noPeripherals}>
                <Text style={styles.noPeripheralsText}>
                  Please pair a compatible device to proceed
                </Text>
              </View>
            ) : (
              <FlatList
                data={deviceList}
                renderItem={({item}) => renderItem(item)}
                keyExtractor={item => item.id}
              />
            )}
          </View>
        </>
      ) : (
        <View>
          <Text>Please enable bluetooth</Text>
          <Button title="click to enable bluetooth" onPress={enableBluetooth} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  body: {
    backgroundColor: Colors.white,
  },
  scanButton: {
    margin: 10,
  },
  noPeripherals: {
    flex: 1,
    margin: 20,
  },
  noPeripheralsText: {
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  footerButton: {
    alignSelf: 'stretch',
    padding: 10,
    backgroundColor: 'grey',
  },
  name: {
    fontSize: 12,
    textAlign: 'center',
    color: '#333333',
    padding: 10,
  },
  id: {
    fontSize: 8,
    textAlign: 'center',
    color: '#333333',
    padding: 2,
    paddingBottom: 20,
  },
  rssi: {
    fontSize: 10,
    textAlign: 'center',
    color: '#333333',
    padding: 2,
  },
});

export default Test;
