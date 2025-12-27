import * as FileSystem from 'expo-file-system/legacy';

const logsDir = FileSystem.documentDirectory + 'logs/';

const logger = {
  async init() {
    const dirInfo = await FileSystem.getInfoAsync(logsDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(logsDir, { intermediates: true });
    }
  },

  async logConversations(data) {
    await this.init();
    const logFile = logsDir + 'conversation_log.json';
    await FileSystem.writeAsStringAsync(logFile, JSON.stringify(data, null, 2));
    console.log('📝 CONVERSATIONS DATA:', JSON.stringify(data, null, 2));
  },

  async logMessages(data) {
    await this.init();
    const logFile = logsDir + 'message_log.json';
    await FileSystem.writeAsStringAsync(logFile, JSON.stringify(data, null, 2));
    console.log('📝 MESSAGES DATA:', JSON.stringify(data, null, 2));
  },
};

export default logger;
