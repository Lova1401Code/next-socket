/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { useEffect, useRef, useState } from "react";
import io from 'socket.io-client'
import { Button, Typography, TextField, Box, Paper, List, ListItem, ListItemText } from '@mui/material';
import Image from "next/image";
import styles from "./page.module.css";
import React from "react";

export default function Home() {
  // Url du serveur websocket
  const socket = useRef<any>(null);
  const [messageRoom, setMessageRoom] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);
  const [messagesRoom, setMessagesRoom] = useState<string[]>([]);
  const [messageJoined, setMessageJoined] = useState<string[]>([]);
  const [room, setRoom] = useState<string>('');
  const [joinedRoom, setJoinedRoom] = useState<boolean>(false)
  const [realmName, setRealm] = useState<string>('');
  const [roomRealm, setRoomRealm] = useState<string>('');
  const [messageRealmRoom, setMessageRealmRoom] = useState<string>('');
  const [messagesRealmRoom, setMessagesRealmRoom] = useState<string[]>([]);
  const [joinRoomRealmButton, setJoinRoomRealmButton] = useState<boolean>(false)
  // utilisation de userf
  // connexion au serveur websocket
  useEffect(() => {
    socket.current = io('http://localhost:3000');
    socket.current.on('connect', () => {
      console.log("connecté au serveur")

    })
    // Ecoute du message envoyé par le serveur pour realm room
    socket.current.on('messageRealmRoom', (id: string, data: string) => {
      setMessagesRealmRoom((prev) => [...prev, `${id} : ${data}`])
    })
    // Ecoute du message envoyé par le serveur
    socket.current.on('message', (id: string, data: string) => {
      setMessages((prevMessages) => [...prevMessages, `${id} : ${data}`]); // Ajoute le message reçu à la liste
    });

    // Ecoute du message to room par le serveur
    socket.current.on('messageRoom', (id: string, data: string) => {
      setMessagesRoom((prevMessagesRoom) => [...prevMessagesRoom, `${id} : ${data}`])
    })

    //ecoute du message joined
    socket.current.on('messageJoined', (message: string) => {
      setMessageJoined(prevMessageJoined => [...prevMessageJoined, `${message}`])
    })
    // Nettoyage lors de la déconnexion
    return () => {

      socket.current.off('connect');
      socket.current.off('message');
      socket.current.off('messageRoom');
      socket.current.off('messageJoined');
    };
  }, [])
  // function pour créer un realm
  const createRealm = () => {
    if (realmName) {
      socket.current.emit('createRealm', realmName)
    }
  }
  // function pour envoyer un message au serveur dans room et realm
  const sendMessageRoomRealm = () => {
    if (realmName && roomRealm) {
      socket.current.emit('sendMessageToRealmRoom', { realmName, roomName: roomRealm, message: messageRealmRoom })
    }
  }
  // function pour rejoindre une salle dans un realm 
  const joinRoomRealm = () => {
    if (realmName && roomRealm) {
      socket.current.emit('joinRoomInRealm', { realmName, roomName: roomRealm })

    }
  }
  //function pour quitter une salle dans un realm
  const leaveRoomRealm = () => {
    if (realmName && roomRealm) {
      socket.current.emit('leaveRoomInRealm', { realmName, roomRealm })
    }
  }
  // Function pour rejoindre une salle
  const joinRoom = () => {
    if (room !== '') {
      socket.current.emit('joinRoom', room);
      setJoinedRoom(true);
      setMessageRoom('')
    }
  }

  // function pour quitter une salle 
  const leaveRoom = () => {
    socket.current.emit('leaveRoom', room)
    setJoinedRoom(false)
  }

  // send message to a room specific
  const sendMessageToRoom = () => {
    if (messageRoom !== '') {
      console.log(messageRoom, room)
      socket.current.emit('sendMessage', { room, message: messageRoom })
      setMessageRoom('')
    }
  }

  // function pour envoyer un message au serveur
  const sendingMessage = () => {
    if (message.trim()) {
      socket.current.emit('message', message);
      setMessage('');
    }
  }
  return (
    <div style={{ padding: '20px' }}>
      {/* Affiche le message reçu */}
      <Box sx={{ padding: '20px' }}>
        <Typography variant="h4">Chat en temps réel</Typography>
        <Box sx={{ margin: '20px 0', maxHeight: '300px', overflowY: 'auto' }}>
          {messageJoined.map((msg, index) => (
            <Typography key={index} variant="body1">
              {msg}
            </Typography>
          ))}
        </Box>
        {/* Affichage des messages */}
        <Box sx={{ margin: '20px 0', maxHeight: '300px', overflowY: 'auto' }}>
          {messages.map((msg, index) => (
            <Typography key={index} variant="body1">
              {msg}
            </Typography>
          ))}
        </Box>
        {/* Champ de texte pour saisir le message */}
        <TextField
          label="Votre message"
          variant="outlined"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)} // Met à jour le message en fonction de la saisie utilisateur
          style={{ margin: '20px 0' }}
        />

        {/* Bouton pour envoyer le message */}
        <Button
          variant="contained"
          color="primary"
          onClick={sendingMessage}
          disabled={!message.trim()} // Désactive le bouton si le champ est vide
        >
          Envoyer le message
        </Button>

        {/* Room */}
        <Typography sx={{ mt: '40px' }} variant="h4" gutterBottom>Chat Room</Typography>

        <TextField
          label="Nom de la salle"
          variant="outlined"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={joinRoom}
          disabled={joinedRoom}
          sx={{ mr: 2 }}
        >
          Rejoindre
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={leaveRoom}
          disabled={!joinedRoom}
        >
          Quitter
        </Button>

        {joinedRoom && (
          <>
            <TextField
              label="Message"
              variant="outlined"
              value={messageRoom}
              onChange={(e) => setMessageRoom(e.target.value)}
              fullWidth
              sx={{ mt: 3, mb: 2 }}
            />

            <Button
              variant="contained"
              color="success"
              onClick={sendMessageToRoom}
              fullWidth
            >
              Envoyer le message
            </Button>

            {/* Affichage des messages */}
            <Box sx={{ margin: '20px 0', maxHeight: '300px', overflowY: 'auto' }}>
              {messagesRoom.map((msg, index) => (
                <Typography key={index} variant="body1">
                  {msg}
                </Typography>
              ))}
            </Box>
          </>
        )}


        {/* realm */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
          <Paper elevation={3} sx={{ width: '400px', padding: '20px', textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Chat Room with realm
            </Typography>

            {/* Champ pour le nom du Realm */}
            <TextField
              label="Nom du Realm"
              variant="outlined"
              fullWidth
              value={realmName}
              onChange={(e) => setRealm(e.target.value)}

              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              disabled={!realmName.trim()}
              onClick={createRealm}
              sx={{ mb: 2 }}
              fullWidth
            >
              Create realm
            </Button>
            {/* Champ pour le nom du Room */}
            <TextField
              label="Nom du Room"
              variant="outlined"
              fullWidth
              value={roomRealm}
              onChange={(e) => setRoomRealm(e.target.value)}
              sx={{ mb: 2 }}
            />

            {/* Boutons pour rejoindre et quitter le room */}
            <Button
              variant="contained"
              color="primary"
              onClick={joinRoomRealm}
              disabled={joinRoomRealmButton}
              sx={{ mb: 2 }}
              fullWidth
            >
              Join Room
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={leaveRoomRealm}
              disabled={!joinRoomRealmButton}
              sx={{ mb: 2 }}
              fullWidth
            >
              Leave Room
            </Button>

            {/* Champ pour écrire un message */}
            <TextField
              label="Message"
              variant="outlined"
              fullWidth
              value={messageRealmRoom}
              onChange={(e) => setMessageRealmRoom(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              color="primary"
              onClick={sendMessageRoomRealm}
              // disabled={!joinRoomRealmButton || !messageRealmRoom}
              fullWidth
            >
              Envoyer le Message
            </Button>
          </Paper>

          <Box sx={{ width: '400px', mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Messages reçus dans le room:
            </Typography>
            <Paper elevation={3} sx={{ maxHeight: '300px', overflow: 'auto' }}>
              <List>
                {messagesRealmRoom.map((msg, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={msg} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        </Box>
      </Box>
    </div >
  );
}
