const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function anagram(inputString){
    let words = inputString.split(" "), matchedWordArray = [];
    if(words.length < 2){
        console.log("Invalid input string!");
        return;
    }
    words.forEach((eachWord, i) => {
        if(eachWord.length == 1){
            return;
        }
        words.forEach((eachWordAgain, j) => {
            if(i != j && i < j && eachWord.length == eachWordAgain.length){
                let matchCount = 0;
                for (var k = 0; k < eachWord.length; k++) {
                    if(eachWordAgain.indexOf(eachWord[k]) != -1){
                        matchCount++;
                    }
                }
                if(matchCount == eachWordAgain.length){
                    let sortedArray = eachWordAgain.split('').slice().sort()
                    if(matchedWordArray.length == 0){
                        matchedWordArray.push(sortedArray);
                    } else {
                        let alreadyAdded = false;
                        matchedWordArray.forEach((innerArray)=>{
                            if(equals(innerArray, sortedArray) == true){
                                alreadyAdded = true;
                            }
                        });
                        if(alreadyAdded === false){
                            matchedWordArray.push(sortedArray);
                        }
                    }
                    console.log(matchedWordArray)
                }
            }
        });    
    });
    return matchedWordArray.length;
}

//console.log(anagram("aa aa odg dog gdo"));
//console.log(anagram("a c b c run urn urn"));
//console.log(anagram("k k k k bar foo"));