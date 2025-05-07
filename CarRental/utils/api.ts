import { AppConstants } from '@/constants/appConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TokenType = 'user' | 'company';

export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {},
  customBaseUrl?: string,
  tokenType: TokenType = 'user'
) => {
  const baseUrl = customBaseUrl || AppConstants.LOCAL_URL;
  const url = `${baseUrl}${endpoint}`;
  const tokenKey = tokenType === 'company' ? 'companyAccessToken' : 'accessToken';
  const token = await AsyncStorage.getItem(tokenKey);

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const requestOptions = {
    credentials: 'include' as RequestCredentials,
    ...options,
    headers,
  };

  console.log('[apiFetch] Request Details:', {
    url,
    method: options.method || 'GET',
    tokenType,
    headers,
    body: options.body || null,
  });

  try {
    const response = await fetch(url, requestOptions);
    const responseText = await response.text();
    let data;

    try {
      data = JSON.parse(responseText);
    } catch (err) {
      console.warn('[apiFetch] Response not JSON:', responseText);
      data = responseText;
    }

    if (!response.ok) {
      console.log('[apiFetch] API Error Response:', {
        status: response.status,
        data: JSON.stringify(data, null, 2),
      });
      const errorMsg = (data && data.message) || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    console.log('[apiFetch] Successful Response:', {
      status: response.status,
      data,
    });

    return data;
  } catch (err: any) {
    console.log('[apiFetch] Exception caught:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
       throw err;
  }
};
