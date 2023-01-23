import React from 'react';
import {SafeAreaView, useColorScheme} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import Ble_Plx from './src/Ble_Plx';
import Home from './src/Home';
import Test from './src/Test';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      {/* <Test /> */}
      <Home />
      {/* <Ble_Plx /> */}
    </SafeAreaView>
  );
};

export default App;
