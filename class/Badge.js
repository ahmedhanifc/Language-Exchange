class Badge{
    activePath = ""
    completed = false;
    constructor(name, description,target,completedImageName,incompletedImageName){
        this.name = name
        this.description = description
        this.target = target
        this.completedImageName = completedImageName
        this.incompletedImageName = incompletedImageName
        this.activePath = incompletedImageName //by default,setting activePath to the incompletedPath. Will be checked in
        //requirementsMet attribute
    }

    requirementsMet(feature){
        if(feature >= this.target){
            this.activePath = this.completedImageName;
            this.completed = true;
            return true
        }
        return false;
    }
}

module.exports = Badge