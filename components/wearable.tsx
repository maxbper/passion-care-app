import React, { useEffect, useState } from 'react';
import { Button, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { router } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useUserColor } from '../context/cancerColor';

const redirectUri = AuthSession.makeRedirectUri();
console.log(redirectUri);

const discovery = {
    authorizationEndpoint: 'https://www.fitbit.com/oauth2/authorize',
    tokenEndpoint: 'https://api.fitbit.com/oauth2/token',
    revocationEndpoint: 'https://api.fitbit.com/oauth2/revoke',
  };

export const refreshTokens = async (tokens) => {
    try {
        const authHeader = 'Basic ' + btoa('23Q8JD:c81306135c907ced1be837f3625ce86d');
    
        const body = new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokens.refreshToken,
        });
    
        const response = await fetch(discovery.tokenEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        });
    
        const refreshed = await response.json();
    
        if (refreshed.accessToken) {
          await ReactNativeAsyncStorage.setItem('tokens', JSON.stringify(refreshed));
          return refreshed.accessToken;

        } else {
          return null;
        }
      } catch (err) {
        console.error('Error refreshing token:', err);
        return null;
      }
}
  
export default function WearableComponent() {
    const cancerColor = "#845BB1";
    const [isConnected, setIsConnected] = useState(false);

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
        clientId: '23Q8JD',
        scopes: ['activity', 'heartrate', 'sleep', 'profile'],
        redirectUri,
        responseType: 'code',
        },
        discovery
    );

    useEffect(() => {

        const exchangeCodeForTokens = async () => {
            if (response?.type === 'success') {
              const { code } = response.params;

                try {
                    const tokenResponse = await AuthSession.exchangeCodeAsync(
                    {
                        code,
                        clientId: '23Q8JD',
                        redirectUri,
                        extraParams: {
                        code_verifier: request.codeVerifier,
                        prompt: 'login',
                        },
                    },
                    discovery
                    );
                    if (tokenResponse.accessToken) {
                        await ReactNativeAsyncStorage.setItem('tokens', JSON.stringify(tokenResponse));
                        setIsConnected(true);
                    }
        
                } catch (error) {
                    console.error('Error exchanging code:', error);
                }

            } else if (response?.type === 'error') {
              console.error('Authentication error:', response.error);
            }
          };      
          exchangeCodeForTokens();

          const checkStoredToken = async () => {
            const tokenData = await ReactNativeAsyncStorage.getItem('tokens');
            if (tokenData) {
              try {
                const parsed = JSON.parse(tokenData);
                if (parsed.accessToken) {
                  setIsConnected(true);
                }
              } catch (e) {
                setIsConnected(false);
              }
            }
          };
        checkStoredToken();

    }, [response, request, isConnected]);

    const disconnectFitbit = async () => {
        const tokenData = await ReactNativeAsyncStorage.getItem('tokens');
        if (tokenData) {
            const { accessToken } = JSON.parse(tokenData);
            await AuthSession.revokeAsync(
                { token: accessToken },
                discovery
            );
            await ReactNativeAsyncStorage.removeItem('tokens');
            setIsConnected(false);
        }
    };

    const connectFitbit = async () => {
      promptAsync();
    };

    return (
        <TouchableOpacity onPress={isConnected ? () => disconnectFitbit() : () => connectFitbit()} style={styles.button}>
                <Feather name="watch" size={36} color={cancerColor}/>
                <View style={styles.statusIcon}>
                    {isConnected ? (
                        <FontAwesome
                        name="check-circle"
                        size={20}
                        color={"green"}
                        />
                    ) : (
                        <FontAwesome
                        name="exclamation-circle"
                        size={20}
                        color={"red"}
                        />
                    )}
                </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        marginVertical: 0,
        backgroundColor: "#fff",
        width: 100,
        height: 100,
        elevation: 3,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#000",
        borderRadius: 50,
      },
      statusIcon: {
        position: 'absolute',
        top: 20,
        right: 25,
      },
 });