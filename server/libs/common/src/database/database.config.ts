import { registerAs } from '@nestjs/config'

export default registerAs('database', () => ({
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
}))
