import React from 'react';
import { View, Text } from 'react-native';

const FlexDemo: React.FC = () => {
  return (
    // Parent container: takes full screen, column direction, center items horizontally and vertically
    <View className="flex-1 flex-col items-center justify-center bg-slate-100 p-5">
      <Text className="text-2xl font-bold mb-5">Flexbox Demo</Text>

      {/* Row of items */}
      <View className="flex-row justify-around bg-sky-200 p-3 w-full mb-5 rounded">
        <View className="bg-sky-500 p-3 rounded"><Text className="text-white">Item 1</Text></View>
        <View className="bg-sky-600 p-3 rounded"><Text className="text-white">Item 2</Text></View>
        <View className="bg-sky-700 p-3 rounded"><Text className="text-white">Item 3</Text></View>
      </View>

      {/* Column of items, one taking more space */}
      <View className="flex-col items-stretch bg-emerald-200 p-3 w-full rounded">
        <View className="bg-emerald-500 p-3 mb-2 rounded"><Text className="text-white text-center">Fixed Height</Text></View>
        <View className="flex-1 bg-emerald-600 p-3 mb-2 rounded">
          <Text className="text-white text-center">Flex 1 (Takes remaining space)</Text>
        </View>
        <View className="bg-emerald-700 p-3 rounded"><Text className="text-white text-center">Another Fixed</Text></View>
      </View>
    </View>
  );
};

export default FlexDemo;