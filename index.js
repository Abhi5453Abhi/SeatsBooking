const mongoose = require("mongoose");
const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
var Seat = require("./Seat");

mongoose.connect("mongodb+srv://abhi5453abhi:Jasveen%402020@cluster0.57ahw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");
// console.log(process.env.DATABASE);
// mongoose.connect("mongodb://localhost/testdb");

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
    // console.log(Seats);
    var SeatString = Seats.value;
    for(var i=0;i<80;i++){
        if(SeatString[i] == '0'){
            ct++;
        }
    }
    console.log(ct);
    if(ct >= input && input <= 7){
        updateSeats(SeatString);
    }else{
        console.log("Not Possible");
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
            console.log("Empty row found");
            start -= 7;
            for(j=0;j<7;j++){
                if(SeatString[start] == '0'){
                    SeatArray[start++] = '1';
                    var row_number = i+1;
                    var col_number = j+1;
                    result += "Seat number " + row_number + " " +col_number + "<br>";
                    console.log("Seat number ",i+1," ",j+1);
                    input--;
                }else{
                    start++;
                }
                if(input == 0){
                    var newSeatsString = SeatArray.join("");
                    console.log(newSeatsString);
                    await Seat.findOneAndUpdate({name: "Seats"},{$set: {value: newSeatsString }});
                    return;
                }
            }
        }
    }
    console.log("Empty row not found");
    var start = 0;
    var SeatArray = SeatString.split("");
    for(var i=0;i<11;i++){
        for(var j=0;j<7;j++){
            if(SeatString[start] == '0'){
                SeatArray[start++] = '1';
                var row_number = i+1;
                var col_number = j+1;
                result += "Seat number " + row_number + " " +col_number + "<br>";
                console.log("Seat number ",i+1," ",j+1);
                input--;
            }else{
                start++;
            }
            if(input == 0){
                var newSeatsString = SeatArray.join("");
                console.log(newSeatsString);
                await Seat.findOneAndUpdate({name: "Seats"},{$set: {value: newSeatsString }});
                return;
            }
        }
    }

    for(var i=0;i<3;i++){
        if(SeatString[start] == '0'){
            SeatArray[start++] = '1';
            var row_number = 12;
            var col_number = i+1;
            result += "Seat number " + row_number + " " +col_number + "<br>";
            console.log("Seat number ",i+1," ",j+1);
            input--;
        }else{
            start++;
        }
        if(input == 0){
            var newSeatsString = SeatArray.join("");
            console.log(newSeatsString);
            await Seat.findOneAndUpdate({name: "Seats"},{$set: {value: newSeatsString }});
            return;
        }
    }
}

async function initalise()
{
    var SeatString = "";
    for(var i=0;i<80;i++){
        SeatString += '0';
    }
    await Seat.create({name: "Seats",value: SeatString});
    console.log(SeatString);
}
    

    if (input !== "") {
        response.send("Your seats are<br>" + result);
    } else {
        response.send("Please provide us no of seats");
    }


});





const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Application started and Listening on port 3000");
  });

