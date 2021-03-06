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

import styles from '../styles/styles';
import { Formik } from 'formik';

import { MonoText } from '../components/StyledText';
import CustomModal from '../components/CustomModal';
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
  const [modalMessage, setModalMessage] = useState();

  let modalCmp = <CustomModal modalVisible={modalVisible}>{modalMessage}</CustomModal>;

  const setMessages = message => {
    setAdminMessages(prev => {
      return [message].concat(prev);
    });
  };

  useEffect(() => {
    socket.on('checkCurrentUser', user => {
      console.log('users', user.count);
      console.log('users Room', user.room);
      if (user.count > 8) {
        setModalMessage(
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              //  flexDirection: 'row',
            }}
          >
            <Text style={{ marginTop: 90 }}>Full</Text>

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.buttonTitle}>Go out</Text>
            </TouchableOpacity>
          </View>,
        );
        setModalVisible(true);
      } else {
        setModalMessage(
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator />
          </View>,
        );
        setModalVisible(true);

        setTimeout(() => {
          setModalVisible(false);
        }, 1000);
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
          {modalCmp}
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
              {users.map((item, index) => (
                <View key={index} style={styles[`userWrapper${item.index > 4 ? 'Right' : 'Left'}`]}>
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
          {modalCmp}
          <View style={styles.playerWrapper}></View>
          <View style={styles.gameWrapper}>
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
          </View>
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

export default HomeScreen;
