import * as WebBrowser from 'expo-web-browser';
import * as React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View, TextInput, Button, FlatList, AsyncStorage  } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Formik } from 'formik';

import { MonoText } from '../components/StyledText';

import io from 'socket.io-client/dist/socket.io';



export default class HomeScreen extends React.Component {
  constructor(props){
    super(props);
    this.socket = io('http://192.168.1.152:3000'); // your router ip address here instead of localhost
  }
  state = {
    room: undefined,
    name: undefined,
    users: []
  }

  setStateData = (key, value) => {
    this.setState({ [key]: value })
  }

  componentDidMount = () => {
    this.socket.on('updateUserList', (users) => {
      console.log('current users', users)
      this.setStateData('users', users)
    })
  }

  handleLeave = () => {
    this.socket.emit('leave', {room: this.state.room, name: this.state.name}, () => {
      this.setStateData('room', undefined)
    })
  }

  onSubmit = (values) => {
    console.log('on submit', values)
    this.socket.emit('join', values, () => {
      console.log('emit sucess!')
      this.setStateData('room', values.room)
      this.setStateData('name', values.name)
      
    })
  }

  render() {
    return (
      <View style={styles.container}>
        {
          this.state.room ? 
            <View>
              <Text>User: {this.state.name}</Text>
              <Text>Room: {this.state.room}</Text>
              <Button onPress={this.handleLeave} title="Go out"></Button>
              <Text>List of users:</Text>
              <FlatList 
                data={this.state.users}
                renderItem={({item, index}) => <Text key={index}>{index + 1}: {item}</Text>}  
              />
            </View>
            :
            <Formik
              initialValues={{ room: this.state.room, name: this.state.name }}
              onSubmit={values => this.onSubmit(values)}
            >
              {({ handleChange, handleBlur, handleSubmit, values }) => {
                return (
                  <View>
                    <Text>Room</Text>
                    <TextInput
                      onChangeText={handleChange('room')}
                      onBlur={handleBlur('room')}
                      value={values.room}
                    />
                    <Text>User</Text>
                    <TextInput
                      onChangeText={handleChange('name')}
                      onBlur={handleBlur('name')}
                      value={values.name}
                    />
                    <Button onPress={handleSubmit} title="Go" />
                  </View>
                )
              }}
            </Formik>
          }
      </View>
    )
  }
}

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
        Development mode is enabled: your app will be slower but you can use useful development
        tools. {learnMoreButton}
      </Text>
    );
  } else {
    return (
      <Text style={styles.developmentModeText}>
        You are not in development mode: your app will run at full speed.
      </Text>
    );
  }
}

function handleLearnMorePress() {
  WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/workflow/development-mode/');
}

function handleHelpPress() {
  WebBrowser.openBrowserAsync(
    'https://docs.expo.io/versions/latest/get-started/create-a-new-app/#making-your-first-change'
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
