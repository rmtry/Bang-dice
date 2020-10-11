import React from 'react';
import { Platform, View } from 'react-native';
import styles from '../styles/styles';
let Modal;
if (Platform.OS === 'web') {
  Modal = require('modal-enhanced-react-native-web').default;
} else if (Platform.OS === 'ios' || Platform.OS === 'android') {
  Modal = require('react-native-modal').default;
}
const CustomModal = props => {
  return (
    <Modal
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropColor="black"
      backdropOpacity={0.7}
      coverScreen={false}
      isVisible={props.modalVisible}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={styles.modal}>{props.children}</View>
      </View>
    </Modal>
  );
};
export default CustomModal;
