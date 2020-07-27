import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Button,
  FlatList,
  AsyncStorage,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import { CheckBox } from 'native-base';
// import { ScrollView } from 'react-native-gesture-handler';
import { Formik } from 'formik';

import { MonoText } from '../components/StyledText';

import io from 'socket.io-client/dist/socket.io';
const socket = io('http://127.0.0.1:3000'); // your router ip address here instead of localhost

const HomeScreen = props => {
  const [gameBegun, setGameBegun] = useState(false);
  const [adminMessages, setAdminMessages] = useState([]);
  const [id, setId] = useState();
  const [room, setRoom] = useState();
  const [name, setName] = useState();
  const [users, setUsers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const signupForm = (
    <Formik initialValues={{ room: room, name: name }} onSubmit={values => onSubmit(values)}>
      {({ handleChange, handleBlur, handleSubmit, values }) => {
        return (
          <View>
            <Text>Room</Text>
            <TextInput onChangeText={handleChange('room')} onBlur={handleBlur('room')} value={values.room} />
            <Text>User</Text>
            <TextInput onChangeText={handleChange('name')} onBlur={handleBlur('name')} value={values.name} />
            <Button onPress={handleSubmit} title="Go" />
          </View>
        );
      }}
    </Formik>
  );

  const modalCmp = (
    <Modal
      backdropColor="black"
      backdropOpacity={1}
      style={{ borderWidth: 0, borderColor: 'none' }}
      isVisible={modalVisible}
    >
      <View>
        <ActivityIndicator style={{ justifyContent: 'center', alignItems: 'center' }} />
      </View>
    </Modal>
  );
  const [cmp, setCmp] = useState(signupForm);

  const showModal = () => {
    setModalVisible(true);
    setTimeout(() => {
      setModalVisible(false);
      console.log('cc dmm');
    }, 2000);
  };

  /* setMessages = message => {
      setState(prevState => ({ adminMessages: prev   adminMessages.concat([message]) }));
  }; */

  const setMessages = message => {
    setAdminMessages(prev => {
      return prev.concat([message]);
    });
  };

  useEffect(() => {
    socket.on('user.count', user => {
      console.log('users', user.count);
      console.log('users Room', user.room);
      if (user.count > 4) {
        setCmp(
          <div>
            <p>Full</p>
            <Button onPress={() => setCmp(signupForm)} title="Go out"></Button>
          </div>,
        );
      }
    });
    // socket to update users in a room
    socket.on('updateUserList', users => {
      console.log('current users', users);

      let i = 1;
      users = users.map(user => {
        user.index = i;
        i++;
        if (user.id === socket.id) setIsReady(user.isReady);

        return user;
      });

      setUsers(users);
    });

    // socket to receive message from server
    socket.on('adminMessage', res => {
      console.log(res.time, res.message);

      setMessages(res);
      console.log(adminMessages);
    });

    // socket to receive game data
    socket.on('gameData', res => {
      setGameBegun(true);
      console.log(res);
    });
  }, []);

  const handleLeave = () => {
    socket.emit('leave', { room: room, name: name }, () => {
      setRoom(undefined);
    });
  };

  const handleReady = () => {
    socket.emit('ready', { id: socket.id, room: room, isReady: !isReady }, () => {});
  };

  const onSubmit = values => {
    console.log('on submit', values);
    showModal();
    socket.emit('join', values, () => {
      console.log('emit sucess!');
      console.log(values.room);

      setRoom(values.room);
      setName(values.name);
      setIsReady(false);
    });
  };

  return (
    <View style={styles.container}>
      {/* <View style={styles.modal}>
        <Modal transparent presentationStyle="fullScreen" animationType="slide" visible={modalVisible}>
          <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
        </Modal>
      </View> */}

      {gameBegun ? (
        <View>
          <Text>The game has begun</Text>
          <ScrollView style={styles.messagesContainer}>
            <FlatList
              data={adminMessages}
              renderItem={({ item }) => (
                <View style={styles.checkboxContainer}>
                  <Text>
                    {item.time}: {item.message}{' '}
                  </Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </ScrollView>
        </View>
      ) : room ? (
        <View style={{ flex: 1 }}>
          {modalCmp}
          <FlatList
            data={users}
            renderItem={({ item }) => (
              <View style={styles.checkboxContainer}>
                <Text key={item.index}>
                  {item.index}: {item.name}{' '}
                </Text>
                <CheckBox disabled={true} style={styles.checkBox} checked={item.isReady} />
              </View>
            )}
            ListHeaderComponent={
              <View>
                <Text>User: {name}</Text>
                <Text>Room: {room}</Text>
                <Button onPress={handleReady} title={!isReady ? 'Ready?' : 'Not Ready'} />
                <Button onPress={handleLeave} title="Go out"></Button>
                <Text>List of users:</Text>
              </View>
            }
            keyExtractor={(item, index) => index.toString()}
          />
          <View>
            <FlatList
              data={adminMessages}
              renderItem={({ item }) => (
                <View style={styles.checkboxContainer}>
                  <Text key={item.index}>
                    {item.time}: {item.message}{' '}
                  </Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </View>
      ) : (
        cmp
      )}
    </View>
  );
};

HomeScreen.navigationOptions = {
  header: null,
};

function DevelopmentModeNotice() {
  if (__DEV__) {
    const learnMoreButton = (
      <Text onPress={handleLearnMorePress} style={styles.helpLinkText}>
        Learn more
      </Text>
    );

    return (
      <Text style={styles.developmentModeText}>
        Development mode is enabled: your app will be slower but you can use useful development tools. {learnMoreButton}
      </Text>
    );
  } else {
    return (
      <Text style={styles.developmentModeText}>You are not in development mode: your app will run at full speed.</Text>
    );
  }
}

function handleLearnMorePress() {
  WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/workflow/development-mode/');
}

function handleHelpPress() {
  WebBrowser.openBrowserAsync(
    'https://docs.expo.io/versions/latest/get-started/create-a-new-app/#making-your-first-change',
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesContainer: {
    height: 250,
  },
  checkbox: {
    alignSelf: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});

export default HomeScreen;
