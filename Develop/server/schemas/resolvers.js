const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');

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

            const token = generateToken(user);

            return {
                token,
                user,
            };
        }
    }
}