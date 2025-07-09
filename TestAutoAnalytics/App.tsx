import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { AutoAnalyticsProvider, useAutoAnalytics } from './lib/index';

function MainApp() {
  const { track, setUserId } = useAutoAnalytics({
    config: {
      platforms: [
        {
          name: 'console',
          initialize: (config: any) => {
            console.log('Console platform initialized:', config);
          },
          track: (event: any) => {
            console.log('AUTO-ANALYTICS EVENT:', event);
          }
        }
      ],
      rules: [
        {
          selector: 'TouchableOpacity',
          eventType: 'press',
          eventName: 'button_clicked',
          properties: { element_type: 'button' }
        }
      ],
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      enableAutoTracking: true,
      debugMode: true
    }
  });

  const handleButtonPress = () => {
    // This will be automatically tracked by the analytics system
    console.log('Button pressed - should be auto-tracked!');
  };

  const handleSetUserId = () => {
    setUserId(`user_${Date.now()}`);
    // This will be automatically tracked by the analytics system
    console.log('User ID set - should be auto-tracked!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auto Analytics Test App</Text>
      <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
        <Text style={styles.buttonText}>Track Button Press</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSetUserId}>
        <Text style={styles.buttonText}>Set User ID</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSetUserId}>
        <Text style={styles.buttonText}>Test Button</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <AutoAnalyticsProvider
      options={{
        config: {
          platforms: [
            {
              name: 'console',
              initialize: (config: any) => {
                console.log('Console platform initialized:', config);
              },
              track: (event: any) => {
                console.log('AUTO-ANALYTICS EVENT:', event);
              }
            }
          ],
          rules: [
            {
              selector: 'button',
              eventType: 'click',
              eventName: 'button_clicked',
              properties: { element_type: 'button' }
            }
          ],
          sessionTimeout: 30 * 60 * 1000, // 30 minutes
          enableAutoTracking: true,
          debugMode: true
        }
      }}
    >
      <MainApp />
    </AutoAnalyticsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    minWidth: 200,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
