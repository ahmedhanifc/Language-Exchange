const Badge = require("../class/Badge")

class BadgeManagement{
    static badges = {};

    static createBadge(name, description,target,completedImageName,incompletedImageName){
        const badge = new Badge(name, description,target,completedImageName,incompletedImageName);
        if(!(badge.name in this.badges)){
            this.badges[badge.name] = badge;
        }
    }

    static getBadges(){
        return this.badges;
    }


}

module.exports = BadgeManagement