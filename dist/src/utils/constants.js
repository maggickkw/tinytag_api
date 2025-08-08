"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const USER_ROLES = {
    admin: 'admin',
    volunteer: 'volunteer'
};
const APPLICATION_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    UNDER_REVIEW: 'UNDER_REVIEW'
};
const GENDER = {
    male: 'male',
    female: 'female',
};
const FILE_TYPES = {
    PROFILE_PHOTO: 'PROFILE_PHOTO',
    ID_PHOTO_FRONT: 'ID_PHOTO_FRONT',
    ID_PHOTO_BACK: 'ID_PHOTO_BACK',
    DOCUMENT: 'DOCUMENT'
};
module.exports = {
    USER_ROLES,
    APPLICATION_STATUS,
    GENDER,
    FILE_TYPES
};
