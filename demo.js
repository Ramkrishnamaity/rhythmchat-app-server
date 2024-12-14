

const printDiagram = (n) => {

    let num = 1
    for(let i = 0; i < n; i++) {
        let s = ""
        let to = 1
        if(i !== 0) to = i+2
        for(let j = 0; j < i+to; j++) {
            s = s + num
            num++
        }
        console.log(s)
    }

}

printDiagram(3)