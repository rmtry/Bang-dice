import { StyleSheet, Platform } from 'react-native';
const styles = StyleSheet.create({
  modal: {
    width: 300,
    height: 300,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowRadius: 6,
    shadowOpacity: 0.26,
    elevation: 5,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,

    //flex: 1,
    /*  margin: 100,
    width: '20%',
    height: '20%',
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
    elevation: 5, */
  },

  //card: { width: '80%', minWidth: 300, maxWidth: '95%', alignItems: 'center' },

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
  modalButton: {
    height: 52,
    backgroundColor: '#2196F3',
    padding: 12,
    marginTop: 100,
    borderRadius: 10,
    alignSelf: 'center',
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

export default styles;
