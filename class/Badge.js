class Badge{
    activePath = ""
    completed = false;
    feature = 0;
    constructor(name, description,target,completedImageName,incompletedImageName){
        this.name = name
        this.description = description
        this.target = target
        this.completedImageName = completedImageName
        this.incompletedImageName = incompletedImageName
        this.activePath = incompletedImageName //by default,setting activePath to the incompletedPath. Will be checked in
        //requirementsMet attribute
    }

    updateFeature(feature){
        this.feature = feature
        this.requirementsMet()
    }

    requirementsMet(){
        if(this.feature >= this.target){
            this.activePath = this.completedImageName;
            this.completed = true;
            return true
        }
        return false;
    }

    conditionMet(condition){
        if(condition){
            this.completed = true;
            this.activePath = this.completedImageName;
            this.feature = 1
            return true
        }
        return false;
    }
}

module.exports = Badge