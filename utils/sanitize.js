function sanitize(obj){
    if(!obj || typeof obj !== "object") return obj;
    const clean =Array.isArray(obj)?[]:{};
    for(const key in obj){
        if(key.startsWith("$"))
            continue;
        const value = obj[key];
        if(typeof value == "object" && value !== null){
            clean[key] = sanitize(value);
        }
        else{
            clean[key] = value;
        }
    }
    return clean;
}

module.exports = sanitize