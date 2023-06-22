const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: (parent, args, context) => {
            if (!context.user) {
                throw new AuthenticationError('You must be logged in to access this data')
            }

            return User.findById(context.user._id);
        }
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user || !user.validatePassword(password)) {
                throw new AuthenticationError('Invalid email or password')
            }

            const token = signToken(user);

            return {
                token,
                user,
            };
        },
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });

            const token = signToken(user);

            return {
                token,
                user
            };
        },
        saveBook: async (parent, { bookData }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You must be logged in to perform this action')
            }

            const user = await User.findByIdAndUpdate(
                context.user._id,
                { $push: { savedBooks: bookData } },
                { new: true }
            );

            return user;
        },
        removeBook: async (parent, { bookId }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You must be logged in to perform this action')
            }

            const user = await User.findByIdAndUpdate(
                context.user._id,
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );

            return user;
        }
    }
}

module.exports = resolvers;