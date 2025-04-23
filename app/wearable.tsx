import React, { useEffect, useState } from 'react';
import { Button, Text, View} from 'react-native';
import * as AuthSession from 'expo-auth-session';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const redirectUri = AuthSession.makeRedirectUri();

const discovery = {
    authorizationEndpoint: 'https://www.fitbit.com/oauth2/authorize',
    tokenEndpoint: 'https://api.fitbit.com/oauth2/token',
    revocationEndpoint: 'https://api.fitbit.com/oauth2/revoke',
  };
  
export default function WearableScreen() {
    const [fitbitData, setFitbitData] = useState<any>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
        clientId: '23Q8JD',
        scopes: ['activity', 'heartrate', 'sleep', 'profile'],
        redirectUri,
        responseType: 'code',
        },
        discovery
    );

    const fetchFitbitData = async (token: string) => {
        const headers = {
          Authorization: `Bearer ${token}`,
        };
      
        const stepsRes = await fetch('https://api.fitbit.com/1/user/-/activities/date/2025-04-23.json', { headers });
        const heartRateRes = await fetch('https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json', { headers });
      
        const stepsData = await stepsRes.json();
        const heartRateData = await heartRateRes.json();
      
        setFitbitData(stepsData["summary"]["steps"]);
    };

    const setTokens = async (tokens) => {
        await ReactNativeAsyncStorage.setItem('tokens', JSON.stringify(tokens));
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
    };
      

    useEffect(() => {
        if (accessToken) {
            fetchFitbitData(accessToken);
        }

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
                        },
                    },
                    discovery
                    );
                    setTokens(tokenResponse);
        
                } catch (error) {
                    console.error('Error exchanging code:', error);
                }

            } else if (response?.type === 'error') {
              console.error('Authentication error:', response.error);
            }
          };      
          exchangeCodeForTokens();

        const getStoredTokens = async () => {
            const storedAccessToken = await ReactNativeAsyncStorage.getItem('accessToken');
            const storedRefreshToken = await ReactNativeAsyncStorage.getItem('refreshToken');

            if (storedAccessToken) {
                setAccessToken(storedAccessToken);
            }
            if (storedRefreshToken) {
                setRefreshToken(storedRefreshToken);
            }
        };
        getStoredTokens();
    }, [response, request, accessToken]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {accessToken ? (
            <>
            <Text>Your Fitbit access token: {accessToken}</Text>
            <Text>Steps: {fitbitData}</Text>
            </>

              
        ) : (
            <Button
            disabled={!request}
            title="Authorize Fitbit"
            onPress={() => {
                promptAsync();
            }}
            />
        )}
        </View>
    );
}