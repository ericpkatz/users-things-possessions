const Sequelize = require('sequelize');
const { STRING, BOOLEAN, UUID, UUIDV4 } = Sequelize;
const conn = new Sequelize(process.env.DATABASE_URL);

const User = conn.define('user', {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4
  },
  name: STRING
});

const Thing = conn.define('thing', {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4
  },
  name: STRING
});

const Possession = conn.define('possession', {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4
  },
  isFavorite: {
    type: BOOLEAN,
    defaultValue: false
  }
});

User.hasMany(Possession);
Possession.belongsTo(User);
Possession.belongsTo(Thing);
Thing.hasMany(Possession);

const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  const [moe, lucy, foo, bar, bazz ] = await Promise.all([
    User.create({ name: 'moe'}),
    User.create({ name: 'lucy'}),
    Thing.create({ name: 'foo'}),
    Thing.create({ name: 'bar'}),
    Thing.create({ name: 'bazz'})
  ]); 

  await Promise.all([
    Possession.create({ userId: lucy.id, thingId: foo.id }),
    Possession.create({ userId: lucy.id, thingId: bar.id }),
    Possession.create({ userId: moe.id, thingId: bazz.id, isFavorite: true }),
  ]);

  const users = await User.findAll({
    include: [
      {
        model: Possession,
        include: [
          Thing
        ]
      }
    ]
  });
  console.log(JSON.stringify(users, null, 2));
  /*

  const things = await Thing.findAll({
    include: [
      Possession
    ]
  });
  console.log(JSON.stringify(things, null, 2));
  */
};

syncAndSeed();
