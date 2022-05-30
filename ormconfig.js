module.exports = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: 3388,
  username: 'neos',
  password: 'password',
  database: 'photo',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/**/*{.ts,.js}'],
  synchronize: false,
  cli: {
    migrationsDir: 'src/migrations',
  },
};
