function loadChart(onlydata){
    var ctx = document.getElementById("price-year-chart");

    var data = {
        datasets: [
            {
                label: 'Precio por kilímetros',
                data: onlydata,
                backgroundColor:"#FF6384",
                hoverBackgroundColor: "#FF6384",
            }]
    };

    var myChart = new Chart(ctx, {
        type: 'bubble',
        data: data,
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });

}
