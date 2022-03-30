const mongoose = require("mongoose");
const express = require('express');
const app = express();
// app.use(express.static('../library'));
const path = require('path');
const router = express.Router();
var Seat = require("./Seat");


mongoose.connect("mongodb+srv://abhi5453abhi:Jasveen%402020@cluster0.57ahw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");

var input;

app.get("/", function (request, response){
    response.sendFile(__dirname+"/views/index.html");
});

app.get("/bookseat", async function (request, response){
    input = request.query.seats;
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
    for(var i=0;i<80;i++){
        if(SeatString[i] == '0'){
            ct++;
        }
    }
    if(ct >= input && input <= 7){
        updateSeats(SeatString);
    }else{
        result += "Not Possible";
    }
}

async function updateSeats(SeatString){
    var SeatArray = SeatString.split("");
    var start = 0;
    for(var i=0;i<11;i++){
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
    var start = 0;
    var SeatArray = SeatString.split("");
    await findClosestSeats(SeatArray,SeatString);
}


async function findClosestSeats(SeatArray,SeatString){
    var emptySeats = new Set();
    for(var i=0;i<80;i++){
        if(SeatString[i] == '0'){
            emptySeats.add(i);
        }
    }
    var emptySeatsArray = [...emptySeats];
    if(emptySeats.size >= input){
        var minDifference = 1000;
        var start = 0;
        var last;
        for(var i=0;i<emptySeatsArray.length-input;i++){
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
    for(var i=0;i<80;i++){
        SeatString += '0';
    }
    await Seat.create({name: "Seats",value: SeatString});
    
}
    

    if (input !== "") {
        response.send("Your seats are <br>"+ result);
    } else {
        response.send("Please provide us no of seats");
    }


});

app.get("/emptyseat", async function(request, response){
    var SeatString = "";
    for(var i=0;i<80;i++){
        SeatString += '0';
    }
    await Seat.findOneAndUpdate({name: "Seats"},{$set: {value: SeatString }});
    response.send("emptied");
});





const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Application started and Listening on port 3000");
  });

