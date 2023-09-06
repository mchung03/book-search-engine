const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async(parent, args, context) => {
            const foundUser = await User.findOne({
                _id: context.user._id
              });
          
              if (!foundUser) {
                throw AuthenticationError;
              }
          
              return (foundUser);
        },
    },
    Mutation: {
        addUser: async(parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        login: async(parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw AuthenticationError;
            }

            const correctPw = await user.isCorrectPassword(password);

            if(!correctPw) {
                throw AuthenticationError;
            }

            const token = signToken(user);

            return { token, user };
        },
        saveBook: async(parent, args, context) => {
            if(context.user) {
                const book = await User.findOneAndUpdate(
                    { _id },
                    { $addToSet: { savedBooks: args.bookData }}
                );

                return book;
            }
            throw AuthenticationError;
        },
        removeBook: async(parent, args, context) => {
            if(context.user) {

                const book = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: {
                        bookId: args.bookId
                    } }}
                );

                return book;
            }
            throw AuthenticationError;
        },
    },
};

module.exports = resolvers;