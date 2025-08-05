"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const USER_ROLES = {
    ADMIN: 'ADMIN',
    VOLUNTEER: 'VOLUNTEER'
};
const APPLICATION_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    UNDER_REVIEW: 'UNDER_REVIEW'
};
const GENDER = {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
    OTHER: 'OTHER',
    PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY'
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
