const { Book, User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        book: async() => {
            return Book.find({});
        },
        user: async(parent, { _id }) => {
            const params = _id ? { _id } : {};
            return User.find(params);
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
        saveBook: async(parent, { bookId }, context) => {
            if(context.user) {
                const book = await Book.findOneAndUpdate(
                    { _id },
                    { $addToSet: { savedBooks: book }}
                );

                return book;
            }
            throw AuthenticationError;
        },
        removeBook: async(parent, { bookId }, context) => {
            if(context.user) {
                const book = await Book.findOneAndDelete({
                    _id: bookId
                });

                await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { books: book._id }}
                );

                return book;
            }
            throw AuthenticationError;
        },
    },
};

module.exports = resolvers;