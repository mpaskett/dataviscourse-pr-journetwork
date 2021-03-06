// class implementing the horizontalBars
// adapted from votePercentageChart.js
class HorizontalBars {

    constructor(){
        //initialize svg elements, svg sizing
        this.margin = {top: 10, right: 10, bottom: 20, left: 10};
        let divHorizontalBars = d3.select("#horizontalBars").classed("horizontalBars", true);

        //fetch the svg bounds
        this.svgBounds = divHorizontalBars.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = this.svgBounds.height - this.margin.bottom - this.margin.top;

        //add the svg to the div
        this.svg = divHorizontalBars.append("svg")
            .attr("width", 1.4*this.svgWidth)
            .attr("height", 395);//TODO: fix this to not be hardcoded

        //add a group for each political party to the svg
        this.svg.append('g')
            .classed('citedBars', true);
        this.svg.append('g')
            .classed('citingBars', true);

        //set up stable params for bars
        this.barHeight = 18;
        // this.padding = 30;
        this.padding = 50;

		//for reference: https://github.com/Caged/d3-tip
		//Use this tool tip element to handle any hover over the chart
		this.tip = d3.tip().attr('class', 'd3-tip')
			.direction('s')
			.offset(function() {
				return [0,0];
			});
    };


	/**
	 * Renders the HTML content for tool tip
	 *
	 * @param tooltip_data information that needs to be populated in the tool tip
	 * @return text HTML content for toop tip
	 */
	tooltip_render (tooltip_data) {
	    // let text = "<h2 class ="  + this.chooseClass(tooltip_data.winner) + " >" + tooltip_data.state + "</h2>";
        let text = "<h3>" + tooltip_data.Journal + "</h3>";
	    text += "<ul class = searchResults>";
	    // text += "<li class = " + this.chooseClass(row.party) + ">" + row.nominee + ":\t\t" + row.votecount + "\t(" + row.percentage + "%)" + "</li>"
        text += "<li>Cited:\t" + tooltip_data.Cited + "</li>";
        text += "<li>Citing:\t" + tooltip_data.Citing + "</li>";
        text += "</ul>";
        text += "</ul>";
	    return text;
	}

	/**
	 * Creates the horizontalBars, content and tool tips
	 *
     * @param cited - cited information for each year of journal data
     * @param citing - citing information for each year of journal data
     * @param year - year for display
     * @param journal - Journal selection (used for highlighting in chart
     * @param top100 - journal abbreviations and other parameters for top 100 journals
     * @param dataObj - cited and citing data that has been recursively sorted
	 */
	update (cited, citing, year, journal, top100, dataObj){

        // let tip = this.tip;
        this.tip.html((d)=> {
            // let tooltip_data;

            return this.tooltip_render(d);
        });

        // Filter the input data by ALL Journals to get total counts for cited and citing
        this.cited = cited.filter(d => {
            return d['Citing Journal'] === 'ALL Journals';
        });
        this.citing = citing.filter(d => {
            return d['Cited Journal'] === 'ALL Journals';
        });

        // the following empirically found values might prove useful later:
        // max cited = 47014
        // max citing = 22933
        // however, it may be most beneficial to just make the max the max for the current year
        let yearCitedMax = d3.max(this.cited.map(d => parseInt(d[year])));
        let yearCitingMax = d3.max(this.citing.map(d => parseInt(d[year])));
        let yearMax = d3.max([yearCitedMax, yearCitingMax]);
        // Note the 4* is because it will need to be at least twice as wide to have side-by-side bars with labels
        // let domMax = 4*yearMax;
        // let domMax = 7*yearMax;
        let domMax = 2.1*yearMax;

        // Map just the relevant data to avoid unnecessary fluff and combine citing and cited info in one object
        let currCited = this.cited.map(d => parseInt(d[year]));
        let currCiting = this.citing.map(d => parseInt(d[year]));
        let allJournals = this.cited.map(d => d.Journal);

        // check if dataObj has already been generated and passed in (i.e. a sort has already been applied)
        dataObj = dataObj || [];
        // check length to see if empty (i.e. if (dataObj.length === 0) { ... )
        if (dataObj.length === 0) {
            currCited.forEach((d, i) => {
                // find abbreviation for current journal
                let currAb = [];
                top100.forEach(d => {
                    if (d["Full Journal Title"] === allJournals[i]) {
                        currAb.push(d.Title20)
                    }
                });
                dataObj.push({Journal: allJournals[i], Abbreviation: currAb[0], Cited: d, Citing: currCiting[i]});
            });
            // Sort by cited in descending order initially
            dataObj.sort((a,b) => {
                return b.Cited - a.Cited;
            });

            let origData = dataObj;
            // Limit results to just top 15
            dataObj = dataObj.slice(0,15);

            // If current journal is not in top 15, add it to top of DataObj
            let checkMatch = dataObj.filter(d => {
                return d['Journal'].toUpperCase() === journal.toUpperCase();
            });
            if (checkMatch.length === 0) {
                let journalObj = origData.filter(d => {
                    return d['Journal'].toUpperCase() === journal.toUpperCase();
                });
                dataObj.unshift(journalObj[0]);
            } else {
                // place selected journal at top of list, for time being (i.e. until sort time)
                let idx = [];
                dataObj.forEach((d,i) => {
                    if (d['Journal'].toUpperCase() === journal.toUpperCase()) {
                        // console.log(d, i);
                        idx.push(i);
                    }
                });
                let journalObj = dataObj.slice(idx[0],idx[0]+1);
                let newObj = [];
                if (idx[0] === 0) {
                    let below = dataObj.slice(idx[0]+1,dataObj.length);
                    newObj.push(journalObj[0]);
                    below.forEach(d => {
                        newObj.push(d);
                    });
                    dataObj = newObj;
                } else if (idx[0] === dataObj.length-1) {
                    let above = dataObj.slice(0,dataObj.length-1);
                    newObj.push(journalObj[0]);
                    above.forEach(d => {
                        newObj.push(d);
                    });
                    dataObj = newObj;
                } else {
                    let above = dataObj.slice(0,idx[0]);
                    let below = dataObj.slice(idx[0]+1,dataObj.length);
                    newObj.push(journalObj[0]);
                    above.forEach(d => {
                        newObj.push(d);
                    });
                    below.forEach(d => {
                        newObj.push(d);
                    });
                    dataObj = newObj;
                }
            }
        }

        // Create linear scale for all bar charts
        let horzScale = d3.scaleLinear()
            .domain([0, domMax])
            .range([0, this.svgWidth]);

        // Try removing all old rects and text instead of worrying about updating them
        d3.select('.citedBars').selectAll('rect').remove();
        // d3.select('.citedBars').selectAll('text').remove();

        // Now bind the data
        let citedBars = d3.select('.citedBars').selectAll('rect')
            .data(dataObj);
        // let citedText = d3.select('.citedBars').selectAll('text')
        //     .data(dataObj);

        // Now create the horizontal bars for cited
        citedBars.enter().append('rect')
            .attr('height', this.barHeight)
            .attr('width', d => {
                return horzScale(d.Cited);
            })
            .attr('x', 0)
            .attr('y', (d,i) => i*20 + 20)
            .classed('bar', true)
            .attr('id', d => {
                if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                    return 'selectedCited'
                } else {
                    return null
                }
            });

        // Add text to bars
        // citedText.enter().append('text')
        //     .text(d => d.Abbreviation)
        //     .attr('dy', this.barHeight/1.25)
        //     .attr('x', d => {
        //         return horzScale(d.Cited + 500)
        //     })
        //     .attr('y', (d,i) => i*20 + 20)
        //     .classed('bartext', true);


        //
        // Now repeat process for citingBars
        //

        // Try removing all old rects and text instead of worrying about updating them
        d3.select('.citingBars').selectAll('rect').remove();
        d3.select('.citingBars').selectAll('text').remove();

        // Now bind the data
        let citingBars = d3.select('.citingBars').selectAll('rect')
            .data(dataObj);
        let citingText = d3.select('.citingBars').selectAll('text')
            .data(dataObj);

        // Now create the horizontal bars for citing
        citingBars.enter().append('rect')
            .attr('height', this.barHeight)
            .attr('width', d => {
                return horzScale(d.Citing);
            })
            .attr('x', 0)
            .attr('y', (d,i) => i*20 + 20)
            .classed('bar', true)
            .attr('id', d => {
                if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                    return 'selectedCiting'
                } else {
                    return null
                }
            });

        // Add text to bars
        citingText.enter().append('text')
            .text(d => d.Abbreviation)
            .attr('dy', this.barHeight/1.3)
            .attr('x', horzScale(yearCitingMax + 500))
            .attr('y', (d,i) => i*20 + 20)
            .classed('bartext', true)
            .attr('id', d => {
                if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                    return 'selectedBarText'
                } else {
                    return null
                }
            });

        // flip cited group and offset
        d3.select('.citedBars')
            .attr("transform", "translate(" + (horzScale(yearMax) + this.padding - 1) + "," + 30 + ")" + "scale(-1,1)");

        // offset citing group
        d3.select('.citingBars')
            .attr("transform", "translate(" + (horzScale(yearMax) + this.padding + 1) + "," + 30 + ")");

        // d3.select('.citedBars').selectAll('rect')
        //     .call(tip);
        // d3.select('.citingBars').selectAll('rect')
        //     .call(tip);
        // d3.select('.citingBars').selectAll('text')
        //     .call(tip);

        // add hover interactions for cited
        d3.select('.citedBars').selectAll('rect')
            .on('mouseover', function(d) {
                d3.select(this)
                    .attr('id', 'hlightCited')
                    .append('title')
                    .text('Cited: ' + d.Cited + '; Citing: ' + d.Citing)
                    .classed('barsTitle', true);
                let currJ = d.Journal;
                d3.select('.citingBars').selectAll('rect')
                    .attr('id', d => {
                        if (currJ.toUpperCase() === d.Journal.toUpperCase()) {
                            return 'hlightCiting'
                        } else if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                            return 'selectedCiting'
                        } else {
                            return null
                        }
                    });
                d3.select('.citingBars').selectAll('text')
                    .attr('id', d => {
                        if (currJ.toUpperCase() === d.Journal.toUpperCase()) {
                            return 'hlightBarText'
                        } else if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                            return 'selectedBarText'
                        } else {
                            return null
                        }
                    });
                // highlight related nodes in FDN
                d3.select('.nodes').selectAll('circle')
                    .attr('id', d => {
                        if (currJ.toUpperCase() === d.id.toUpperCase()) {
                            return 'hlightCited'
                        } else {
                            return null
                        }
                    });
            })
            .on('mouseout', function(d) {
                d3.select(this)
                    .attr('id', d => {
                        if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                            return 'selectedCited'
                        } else {
                            return null
                        }
                    });
                d3.select('.citingBars').selectAll('rect')
                    .attr('id', d => {
                        if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                            return 'selectedCiting'
                        } else {
                            return null
                        }
                    });
                d3.select('.citingBars').selectAll('text')
                    .attr('id', d => {
                        if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                            return 'selectedBarText'
                        } else {
                            return null
                        }
                    });
                d3.selectAll('.barsTitle').remove();
                d3.select('.nodes').selectAll('circle')
                    .attr('id', null);
            });


        // add hover interactions for citing
        d3.select('.citingBars').selectAll('rect')
            .on('mouseover', function(d) {
                d3.select(this)
                    .attr('id', 'hlightCiting')
                    .append('title')
                    .text('Cited: ' + d.Cited + '; Citing: ' + d.Citing)
                    .classed('barsTitle', true);
                let currJ = d.Journal;
                d3.select('.citedBars').selectAll('rect')
                    .attr('id', d => {
                        if (currJ.toUpperCase() === d.Journal.toUpperCase()) {
                            return 'hlightCited'
                        } else if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                            return 'selectedCited'
                        } else {
                            return null
                        }
                    });
                d3.select('.citingBars').selectAll('text')
                    .attr('id', d => {
                        if (currJ.toUpperCase() === d.Journal.toUpperCase()) {
                            return 'hlightBarText'
                        } else if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                            return 'selectedBarText'
                        } else {
                            return null
                        }
                    });
                // highlight related nodes in FDN
                d3.select('.nodes').selectAll('circle')
                    .attr('id', d => {
                        if (currJ.toUpperCase() === d.id.toUpperCase()) {
                            return 'hlightCited'
                        } else {
                            return null
                        }
                    });
            })
            .on('mouseout', function(d) {
                d3.select(this)
                    .attr('id', d => {
                        if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                            return 'selectedCiting'
                        } else {
                            return null
                        }
                    });
                d3.select('.citedBars').selectAll('rect')
                    .attr('id', d => {
                        if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                            return 'selectedCited'
                        } else {
                            return null
                        }
                    });
                d3.select('.citingBars').selectAll('text')
                    .attr('id', d => {
                        if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                            return 'selectedBarText'
                        } else {
                            return null
                        }
                    });
                d3.selectAll('.barsTitle').remove();
                d3.select('.nodes').selectAll('circle')
                    .attr('id', null);
            });


        // add hover interactions for bars text
        d3.select('.citingBars').selectAll('text')
            .on('mouseover', function(d) {
                d3.select(this)
                    .attr('id', 'hlightBarText')
                    .append('title')
                    .text('Cited: ' + d.Cited + '; Citing: ' + d.Citing)
                    .classed('barsTitle', true);
                let currJ = d.Journal;
                d3.select('.citingBars').selectAll('rect')
                    .attr('id', d => {
                        if (currJ.toUpperCase() === d.Journal.toUpperCase()) {
                            return 'hlightCiting'
                        } else if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                            return 'selectedCiting'
                        } else {
                            return null
                        }
                    });
                d3.select('.citedBars').selectAll('rect')
                    .attr('id', d => {
                        if (currJ.toUpperCase() === d.Journal.toUpperCase()) {
                            return 'hlightCited'
                        } else if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                            return 'selectedCited'
                        } else {
                            return null
                        }
                    });
                // highlight related nodes in FDN
                d3.select('.nodes').selectAll('circle')
                    .attr('id', d => {
                        if (currJ.toUpperCase() === d.id.toUpperCase()) {
                            return 'hlightCited'
                        } else {
                            return null
                        }
                    });
            })
            .on('mouseout', function(d) {
                d3.select(this)
                    .attr('id', d => {
                        if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                            return 'selectedBarText'
                        } else {
                            return null
                        }
                    });
                d3.select('.citingBars').selectAll('rect')
                    .attr('id', d => {
                        if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                            return 'selectedCiting'
                        } else {
                            return null
                        }
                    });
                d3.select('.citedBars').selectAll('rect')
                    .attr('id', d => {
                        if (d.Journal.toUpperCase() === journal.toUpperCase()) {
                            return 'selectedCited'
                        } else {
                            return null
                        }
                    });
                d3.selectAll('.barsTitle').remove();
                // un-highlight any id-ed nodes in FDN
                d3.select('.nodes').selectAll('circle')
                    .attr('id', null);
            });

        // Place scale above bars
        let divis = [];
        if (year === 2017) {
            divis.push(1.7);
        } else if (year === 2016) {
            divis.push(1.9);
        } else if (year === 2015) {
            divis.push(1.98);
        } else if (year === 2014) {
            divis.push(1.79);
        } else if (year === 2013) {
            divis.push(1.78);
        } else if (year === 2012) {
            divis.push(1.86);
        } else if (year === 2011) {
            divis.push(2.1);
        } else if (year === 2010) {
            divis.push(2.08);
        } else if (year === 2009) {
            divis.push(2);
        } else if (year === 2008) {
            divis.push(1.78);
        }

        let fullScale = d3.scaleLinear()
            .domain([-domMax/divis[0], domMax/divis[0]])
            .range([-this.svgWidth/divis[0], this.svgWidth/divis[0]]);

        let xAxis = d3.axisTop();
        if (yearMax < 10000) {
            xAxis
                .scale(fullScale)
                .tickValues([-10000, -5000, 0, 5000, 10000])
                .tickFormat(d => Math.abs(d / 1000) + 'k');
        } else if (yearMax < 40000) {
            xAxis
                .scale(fullScale)
                .tickValues([-40000, -20000, 0, 20000, 40000])
                .tickFormat(d => Math.abs(d/1000) + 'k');
        } else {
            xAxis
                .scale(fullScale)
                .tickValues([-50000, -25000, 0, 25000, 50000])
                .tickFormat(d => Math.abs(d/1000) + 'k');
        }

        d3.selectAll('.barAxis').remove();

        d3.select('#horizontalBars > svg').append('g')
            .classed('barAxis', true)
            .attr("transform", "translate(" + (horzScale(yearMax) + this.padding) + "," + 45 + ")")
            .call(xAxis);

        // Add column headers above bars
        d3.selectAll('.citedHead').remove();
        d3.selectAll('.citingHead').remove();

        d3.select('#horizontalBars > svg').append('text')
            .text('Cited')
            .attr('x', horzScale(0.69*yearMax))
            .attr('y', 20)
            .classed('citedHead', true);

        d3.select('#horizontalBars > svg').append('text')
            .text('Citing')
            .attr('x', horzScale(1.9*yearMax))
            .attr('y', 20)
            .classed('citingHead', true);

        // Sort bars by cited when clicked
        d3.select('.citedHead')
            .on('mouseover', function() {
                d3.select(this).style('cursor','pointer');
            })
            .on('click', function() {
                dataObj.sort((a,b) => {
                    return b.Cited - a.Cited;
                });
                // push updated data back to this update method
                horizontalBars.update(cited, citing, year, journal, top100, dataObj);
            });
        // Sort bars by citing when clicked
        d3.select('.citingHead')
            .on('mouseover', function() {
                d3.select(this).style('cursor','pointer');
            })
            .on('click', function() {
                dataObj.sort((a,b) => {
                    return b.Citing - a.Citing;
                });
                horizontalBars.update(cited, citing, year, journal, top100, dataObj);
            });

        // d3.select('.citedBars').selectAll('rect')
        //     .call(this.tip);
        // d3.select('.citingBars').selectAll('rect')
        //     .call(this.tip);
        // d3.select('.citingBars').selectAll('text')
        //     .call(this.tip);
        // d3.select('.citedBars').selectAll('rect')
        //     .on('mouseover', this.tip.show)
        //     .on('mouseout', this.tip.hide);
        // d3.select('.citingBars').selectAll('rect')
        //     .on('mouseover', this.tip.show)
        //     .on('mouseout', this.tip.hide);
        // d3.select('.citingBars').selectAll('text')
        //     .on('mouseover', this.tip.show)
        //     .on('mouseout', this.tip.hide);
	};


}
