import React, { useState, useEffect } from "react";
import "./App.css";
import MicRecorder from "mic-recorder-to-mp3";
import { Button, Container } from "@material-ui/core";
import AudioPlayer from "material-ui-audio-player";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root:{
    maxWidth: "100vw",
    height: "100%",
    padding: 100,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 50,
  },
  main: {
    height: 100,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  saved: {
    marginTop: "50px",
  },
  savedContent: {
    height: "130px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: 'center'
  },
  buttonsContainer: {
    width: "55%",
    height: "auto",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
  },
  button: {
    width: "80px",
    height: "40px",
    textTransform: "capitalize",
    "&[data-content='record']": {
      backgroundColor: "lightblue",
    },
    "&[data-content='stop']": {
      backgroundColor: "lightblue",
    },
    "&[data-content='save']": {
      backgroundColor: "lightgreen",
    },
    "&[data-content='delete']": {
      backgroundColor: "red",
      marginTop: 10
    },
  },
}));

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [blobURL, setBlobURL] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const classes = useStyles();

  const start = () => {
    if (isBlocked) {
      console.log("Permission Denied");
    } else {
      Mp3Recorder.start()
        .then(() => {
          setIsRecording(true);
        })
        .catch((e) => console.error(e));
    }
  };

  const stop = () => {
    Mp3Recorder.stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const blobURL = URL.createObjectURL(blob);
        setBlobURL(blobURL);
        setIsRecording(false);
      })
      .catch((e) => console.log(e));
  };

  const save = () => {
    const arrayDB = JSON.parse(localStorage.getItem("urlArray"));
    arrayDB.push(blobURL);
    localStorage.setItem("urlArray", JSON.stringify(arrayDB));
    setBlobURL("");
  };

  const deleteRecord = (data) => {
    const arrayDB = JSON.parse(localStorage.getItem("urlArray"));
    let newarray = arrayDB.filter(link => link !== data);
    localStorage.setItem("urlArray", JSON.stringify(newarray));
    window.location.reload();
  };

  useEffect(() => {
    let URLArray = [];
    const arrayDB = JSON.parse(localStorage.getItem("urlArray"));
    if ((arrayDB && arrayDB.length === 0) || !arrayDB) {
      localStorage.setItem("urlArray", JSON.stringify(URLArray));
    }
    navigator.getUserMedia(
      { audio: true },
      () => {
        console.log("Permission Granted");
        setIsBlocked(false);
      },
      () => {
        console.log("Permission Denied");
        setIsBlocked(true);
      }
    );
  }, []);


  let recordings = JSON.parse(localStorage.getItem("urlArray"));
  return (
    <div className={classes.root}>
      <Container className={classes.container} >
        <div className={classes.main}>
          <AudioPlayer
            elevation={1}
            width="500px"
            variation="primary"
            spacing={3}
            debug={false}
            src={blobURL}
            volume
            disabled={!blobURL}
          />
          <div className={classes.buttonsContainer}>
            <Button
              className={classes.button}
              data-content="record"
              variant="contained"
              onClick={start}
              disabled={isRecording}
              disableRipple
            >
              Record
            </Button>
            <Button
              className={classes.button}
              data-content="stop"
              variant="contained"
              onClick={stop}
              disabled={!isRecording}
              disableRipple
            >
              Stop
            </Button>
            <Button
              className={classes.button}
              data-content="save"
              variant="contained"
              onClick={save}
              disabled={!blobURL}
              disableRipple
            >
              Save
            </Button>
          </div>
        </div>
        <div className={classes.saved}>
          {recordings &&
            recordings.length > 0 &&
            recordings.map((recording, index) => {             
              return (
                <div
                  key={index}
                  className={classes.savedContent}
                >
                  <AudioPlayer
                    elevation={1}
                    width="500px"
                    variation="primary"
                    spacing={3}
                    debug={false}
                    src={recording}
                    volume
                  />
                  <Button
                    className={classes.button}
                    variant="contained"
                    data-content="delete"
                    onClick={() => deleteRecord(recording)}
                    disableRipple
                  >
                    Delete
                  </Button>
                </div>
              );
            })}
        </div>
      </Container>
    </div>
  );
};

export default App;
