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
import { CheckBox, Input } from 'native-base';
import Modal from 'react-native-modal';
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
  const [gameData, setGameData] = useState(undefined);
  const [player, setPlayer] = useState(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const signupForm = (
    <Formik initialValues={{ room: room, name: name }} onSubmit={values => onSubmit(values)}>
      {({ handleChange, handleBlur, handleSubmit, values }) => {
        return (
          <View style={styles.miniForm}>
            <Text style={styles.inputLabel}>Room</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={handleChange('room')}
              onBlur={handleBlur('room')}
              value={values.room}
            />
            <Text style={styles.inputLabel}>User</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              value={values.name}
            />
            <TouchableOpacity onPress={handleSubmit} style={styles.button}>
              <Text style={styles.buttonTitle}>GO</Text>
            </TouchableOpacity>
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
      return [message].concat(prev);
    });
  };

  useEffect(() => {
    socket.on('user.count', user => {
      console.log('users', user.count);
      console.log('users Room', user.room);
      if (user.count > 8) {
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
      if (res) setGameData(res);
      console.log(res);
      if (player === undefined) setPlayer(res.players.find(player => player.userId === socket.id));
    });
  }, []);

  const handleLeave = () => {
    socket.emit('leave', { room: room, name: name }, () => {
      setRoom(undefined);
      setAdminMessages([]);
    });
  };

  const handleReady = () => {
    socket.emit('ready', { id: socket.id, room: room, isReady: !isReady }, () => {});
  };

  const handleAction = type => {
    socket.emit('action', { room: room, action: type, name: name, index: gameData.players[0].index }, () => {});
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
        <View styles={styles.roomContainer}>
          <View styles={styles.dash}></View>
          {gameData && (
            <View styles={styles.playerWrapper}>
              <Text>
                {gameData.dices[0].face}, {gameData.dices[0].rolled && 'saved!'}
              </Text>
              <Text>
                {gameData.dices[1].face}, {gameData.dices[1].rolled && 'saved!'}
              </Text>
              <Text>
                {gameData.dices[2].face}, {gameData.dices[2].rolled && 'saved!'}
              </Text>
              <Text>
                {gameData.dices[3].face}, {gameData.dices[3].rolled && 'saved!'}
              </Text>
              <Text>
                {gameData.dices[4].face}, {gameData.dices[4].rolled && 'saved!'}
              </Text>
              <Button
                onPress={() => handleAction('ROLLDICE')}
                title={'Roll'}
                disabled={
                  (gameData.turnRoll > 2 && player && player.index === gameData.currentTurnIndex) ||
                  (player && player.index !== gameData.currentTurnIndex)
                }
              ></Button>
              <Button onPress={() => handleAction('keep')} title={'Save'}></Button>
              <Text>{player !== undefined && player.index}</Text>
            </View>
          )}
          <View styles={styles.gameWrapper}>
            <ScrollView style={styles.messagesWrapper}>
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
          <View style={styles.headerWrapper}>
            <Text style={styles.textTitle}>The game has begun</Text>
          </View>
        </View>
      ) : room ? (
        <View style={styles.roomContainer}>
          <View style={styles.playerWrapper}>
            <Text style={styles.textTitle}>User: {name}</Text>
            <View style={styles.miniForm}>
              <TouchableOpacity style={styles.button} onPress={handleReady}>
                <Text style={styles.buttonTitle}>{!isReady ? 'READY?' : 'NOT READY'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonCancel} onPress={handleLeave}>
                <Text style={styles.buttonTitleCancel}>LEAVE</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.gameWrapper}>
            <View style={styles.usersWrapper}>
              {users.map(item => (
                <View style={styles[`userWrapper${item.index > 4 ? 'Right' : 'Left'}`]}>
                  <Text styles={styles.TextInput} key={item.index} key={item.index}>
                    {item.index}: {item.name}{' '}
                  </Text>
                  <CheckBox disabled={true} style={styles.checkBox} checked={item.isReady} />
                </View>
              ))}
            </View>
            <FlatList
              style={styles.messagesContainer}
              data={adminMessages}
              renderItem={({ item }) => (
                <View style={styles.checkboxContainer}>
                  <Text key={item.index} style={styles.textMessage}>
                    <Text style={styles.boldText}>{item.time}:</Text> {item.message}{' '}
                  </Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>

          <View style={styles.headerWrapper}>
            <Text style={styles.textTitle}>Waiting Room [{room}]</Text>
          </View>
        </View>
      ) : (
        <View style={styles.roomContainer}>
          <View style={styles.playerWrapper}></View>
          <View style={styles.gameWrapper}>{cmp}</View>
          <View style={styles.headerWrapper}>
            <Text style={styles.textTitle}>Join Room</Text>
          </View>
        </View>
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
    color: '#575757',
  },
  dash: {
    height: 10,
    width: 250,
    alignSelf: 'center',
    backgroundColor: 'grey',
  },
  messagesContainer: {
    height: 250,
  },
  roomContainer: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
  playerWrapper: {
    flex: 3,
    padding: 8,
  },
  gameWrapper: {
    flex: 6,
    padding: 8,
    alignItems: 'stretch',
  },
  headerWrapper: {
    flex: 1,
    alignSelf: 'center',
    paddingTop: '2.5%',
  },
  usersWrapper: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignContent: 'space-between',
    height: 200,
    ...Platform.select({
      web: {
        height: '40%',
      },
    }),
  },
  userWrapperLeft: {
    height: 50,
    width: 175,
    padding: 14,
    paddingLeft: 8,
    //backgroundColor: 'grey',
    flexDirection: 'row',
    ...Platform.select({
      web: {
        height: '25%',
        width: '50%',
      },
    }),
  },
  userWrapperRight: {
    height: 50,
    width: 175,
    padding: 14,
    paddingRight: 20,
    //backgroundColor: 'grey',
    flexDirection: 'row',
    ...Platform.select({
      web: {
        height: '25%',
        width: '50%',
      },
    }),
    justifyContent: 'flex-end',
  },
  checkbox: {
    alignSelf: 'center',
  },
  textTitle: {
    fontSize: 20,
    margin: 8,
    marginLeft: 0,
    marginRight: 0,
    color: '#575757',
  },
  textInput: {
    fontSize: 14,
    height: 48,
    backgroundColor: '#ebebeb',
    paddingLeft: 12,
    marginBottom: 8,
    borderRadius: 10,
  },
  textMessage: {
    fontSize: 12,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: 'bold',
  },
  inputLabel: {
    color: 'grey',
    fontSize: 12,
  },
  button: {
    height: 52,
    backgroundColor: '#2196F3',
    padding: 12,
    marginTop: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonCancel: {
    height: 52,
    backgroundColor: 'white',
    borderColor: '#2196F3',
    padding: 12,
    marginTop: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 0.5,
  },
  buttonTitle: {
    fontSize: 16,
    margin: 'auto',
    color: 'white',
  },
  buttonTitleCancel: {
    fontSize: 16,
    margin: 'auto',
    color: '#2196F3',
  },
  miniForm: {
    ...Platform.select({
      web: {
        width: '50%',
        alignSelf: 'center',
      },
    }),
  },
  messagesContainer: {
    backgroundColor: '#ebebeb',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
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
