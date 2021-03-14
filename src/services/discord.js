/* global BigInt */
'use strict';

const config = require('../config.json');

const DiscordOauth2 = require('discord-oauth2');
const oauth = new DiscordOauth2();

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));  
client.login(config.discord.botToken);

class DiscordClient {
    constructor(accessToken) {
        this.accessToken = accessToken;
    }

    setAccessToken(token) {
        this.accessToken = token;
    }

    async getUser() {
        return await oauth.getUser(this.accessToken);
    }

    async getGuilds() {
        const guilds = await oauth.getUserGuilds(this.accessToken);
        const guildIds = Array.from(guilds, x => BigInt(x.id).toString());
        return guildIds;
    }

    async getUserRoles(guildId, userId) {
        try {
            const members = await client.guilds.cache
                .get(guildId)
                .members
                .fetch();
            const member = members.get(userId);
            const roles = member.roles.cache
                .filter(x => BigInt(x.id).toString())
                .keyArray();
            return roles;
        } catch (e) {
            //console.error('Failed to get roles in guild', guildId, 'for user', userId);
        }
        return [];
    }

    static async getGuild(guildId) {
        return await client.guilds.cache
            .get(guildId)
            .fetch();
    }

    static async getMember(guild, userId) {
        return await guild.members.cache
            .get(userId)
            .fetch();
    }

    static getRoleByName(guild, roleName) {
        return guild.roles.cache.find(x => x.name.toLowerCase() === roleName.toLowerCase());
    }

    static async addRole(guildId, userId, roleName) {
        const guild = await this.getGuild(guildId);
        if (!guild) {
            console.error('Failed to find guild by id', guildId);
            return false;
        }
        const member = await this.getMember(guild, userId);
        if (!member) {
            console.error('Failed to find user by id', userId);
            return false;
        }
        const role = this.getRoleByName(guild, roleName);
        if (!role) {
            console.error('Failed to find role by name', roleName);
            return false;
        }
        if (member.roles.cache.get(role.id)) {
            console.info('City role', roleName, 'already assigned to user', member.user.username);
            return true;
        }
        try {
            await member.roles.add(role);
            console.info('Added city role', roleName, 'to user', member.user.username);
            return true;
        } catch (err) {
            console.error('Failed to assign city role', roleName, 'to guild', guildId, 'user', userId, '\r\nError:', err);
            return false;
        }
    }

    static async removeRole(guildId, userId, roleId) {
        const guild = client.guilds.cache
            .get(guildId);
            //.fetch();
        if (!guild) {
            console.error('Failed to find guild by id', guildId);
            return false;
        }
        const member = await this.getMember(guild, userId);
        if (!member) {
            console.error('Failed to find user by id', userId);
            return false;
        }
        const role = guild.roles.cache.get(roleId);
        if (!role) {
            console.error('Failed to find role by id', roleId);
            return false;
        }
        try {
            await member.roles.remove(role, 'User removing city/area');
            console.info('Removed city role', role.name, 'from user', member.user.username);
            return true;
        } catch (err) {
            console.error('Failed to remove city role', roleId, 'from guild', guildId, 'user', userId, '\r\nError:', err);
            return false;
        }
    }

    static async removeAllRoles(guildId, userId, areas) {
        const guild = await this.getGuild(guildId);
        if (!guild) {
            console.error('Failed to find guild by id', guildId);
            return false;
        }
        const member = await this.getMember(guild, userId);
        if (!member) {
            console.error('Failed to find user by id', userId);
            return false;
        }
        try {
            for (const area of areas) {
                const role = this.getRoleByName(guild, area);
                if (!role) {
                    console.error('Failed to find role by name', area);
                    continue;
                }
                await member.roles.remove(role);
                console.info('Removed city role', area, 'from user', member.user.username);
            }
            return true;
        } catch (err) {
            console.error('Failed to remove all city roles from guild', guildId, 'user', userId, '\r\nError:', err);
            return false;
        }
    }

    static async getAllRoles(guildId, userId) {
        const guild = await this.getGuild(guildId);
        if (!guild) {
            console.error('Failed to find guild by id', guildId);
            return false;
        }
        const member = await this.getMember(guild, userId);
        if (!member) {
            console.error('Failed to find user by id', userId);
            return false;
        }
        const roles = member.roles.cache
            .filter(x => BigInt(x.id).toString())
            .keyArray();
        return roles;
    }

    static async getRoleNameById(guildId, roleId) {
        const guild = await this.getGuild(guildId);
        if (!guild) {
            console.error('Failed to find guild by id', guildId);
            return false;
        } 
        const role = guild.roles.cache.get(roleId);
        if (!role) {
            console.error('Failed to find role by id', roleId);
            return false;
        }
        return role.name;
    }
}

module.exports = DiscordClient;