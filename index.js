const mongoose = require("mongoose");
const express = require('express');
const app = express();
// app.use(express.static('../library'));
const path = require('path');
const router = express.Router();
var Seat = require("./Seat");
const constants = require('./constants');
mongoose.connect(constants.mongoConnect);

app.get("/", function (request, response){
    response.sendFile(__dirname+"/views/index.html");
});

app.get("/bookseat", async function (request, response){
    var resultArray = [];
    await initaliseResultArray(resultArray);
    var input = request.query.seats;
    var result = "";
    try{
        await check()
    }catch(e){
        return e;
    }
    

    async function check()
{
    var Seats = await Seat.findOne({});
    if(Seats == null){
        await initalise();
        Seats = await Seat.findOne({});
    }
    var ct = 0;
    var SeatString = Seats.value;
    for(var i=0;i<constants.maxSeats;i++){
        if(SeatString[i] == '0'){
            ct++;
        }
    }
    if(ct >= input && input <= 7){
        await updateSeats(SeatString);
    }else{
        result = "Not Possible"
    }
}

async function updateSeats(SeatString){
    var SeatArray = SeatString.split("");
    var start = 0;
    for(var i=0;i<constants.noOfRows;i++){
        var ct = 0;
        for(var j=0;j<7;j++){
            if(SeatString[start++] == '0'){
                ct++;
            }
        }
        if(ct >= input){
            start -= 7;
            for(j=0;j<7;j++){
                if(SeatString[start] == '0'){
                    SeatArray[start++] = '1';
                    var row_number = i+1;
                    var col_number = j+1;
                    result += "Seat number " + row_number + " " +col_number + "<br>";
                    resultArray[row_number-1][col_number-1] = 2;
                    input--;
                }else{
                    start++;
                }
                if(input == 0){
                    var newSeatsString = SeatArray.join("");
                    await Seat.findOneAndUpdate({name: "Seats"},{$set: {value: newSeatsString }});
                    return;
                }
            }
        }
    }
    ct = 0;
    for(let i=0;i<3;i++){
        if(SeatString[start++] == '0'){
            ct++;
        }
    }
    if(ct >= input){
        start -= 3;
        for(j=0;j<3;j++){
            if(SeatString[start] == '0'){
                SeatArray[start++] = '1';
                var row_number = i+1;
                var col_number = j+1;
                result += "Seat number " + row_number + " " +col_number + "<br>";
                resultArray[row_number-1][col_number-1] = 2;
                input--;
            }else{
                start++;
            }
            if(input == 0){
                var newSeatsString = SeatArray.join("");
                await Seat.findOneAndUpdate({name: "Seats"},{$set: {value: newSeatsString }});
                return;
            }
        }
    }
    var start = 0;
    var SeatArray = SeatString.split("");
    await findClosestSeats(SeatArray,SeatString);
}


async function findClosestSeats(SeatArray,SeatString){
    var emptySeats = new Set();
    //31
    for(var i=0;i<constants.maxSeats;i++){
        if(SeatString[i] == '0'){
            emptySeats.add(i);
        }
    }
    var emptySeatsArray = [...emptySeats];

    if(emptySeats.size >= input){
        var minDifference = 1000;
        var start = 0;
        var last;
        for(var i=0;i<emptySeatsArray.length-input+1;i++){
            last = i+Number(input)-1;
            if(emptySeatsArray[last] - emptySeatsArray[i] < minDifference){
                minDifference = emptySeatsArray[last] - emptySeatsArray[i];
                start = i;
            }
        }
        for(var i=0;i<input;i++){
            SeatArray[emptySeatsArray[start]] = '1';
            var row_number = Math.floor(emptySeatsArray[start]/7);
            var col_number = Math.floor(emptySeatsArray[start]%7);
            result += "Seat number " + row_number + " " +col_number + "<br>";
            resultArray[row_number][col_number] = 2;
            start++;
        }
        var newSeatsString = SeatArray.join("");
        await Seat.findOneAndUpdate({name: "Seats"},{$set: {value: newSeatsString }});
        return;
    }

}

async function initalise()
{
    var SeatString = "";
    for(var i=0;i<constants.maxSeats;i++){
        SeatString += '0';
    }
    await Seat.create({name: "Seats",value: SeatString});
    
}

async function initaliseResultArray(resultArray){
    for(let i=0;i<constants.noOfRows;i++){
        resultArray[i] = [];
        for(let j=0;j<7;j++){
            resultArray[i][j] = 0;
        }
    }
    resultArray[constants.noOfRows] = [];
    for(let i=0;i<3;i++){
        resultArray[constants.noOfRows][i] = 0;
    }
}
    

    if (input !== "") {
        if(result == "Not Possible"){
            response.end("Not enough seats");
        }
        else{
            var Seats = await Seat.findOne({});
            var SeatString = Seats.value;
            var SeatArray = SeatString.split("");
            response.write('<table>')
            var start = 0;
            for(var i=0;i<constants.noOfRows;i++){
                response.write('<tr>')
                for(var j=0;j<7;j++){
                    if(resultArray[i][j] == 2){
                        response.write('<td>'+2+'</td>');
                    }else if(SeatArray[start] == '1'){
                        response.write('<td>'+1+'</td>');
                    }else{
                        response.write('<td>'+0+'</td>');
                    }
                    start++;
                }
                response.write('</tr>')
            }
            for(var j=0;j<3;j++){
                if(resultArray[constants.noOfRows][j] == 2){
                    response.write('<td>'+2+'</td>');
                }else if(SeatArray[start] == '1'){
                    response.write('<td>'+1+'</td>');
                }else{
                    response.write('<td>'+0+'</td>');
                }
                start++;
            }
            response.write('</table>\n')
            response.end('0 -> Empty Seats 1 -> Seats already booked 2 -> Seat Booked just now');
        }
    } else {
        response.end("Please provide us no of seats");
    }


});

app.get("/emptyseat", async function(request, response){
    var SeatString = "";
    for(var i=0;i<constants.maxSeats;i++){
        SeatString += '0';
    }
    await Seat.findOneAndUpdate({name: "Seats"},{$set: {value: SeatString }});
    response.send("emptied");
});





const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Application started and Listening on port ",PORT);
  });

