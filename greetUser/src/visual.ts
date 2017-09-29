/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {

    export function getValue<T>(objects: DataViewObjects, objectName: string, propertyName: string, defaultValue: T): T {
        if (objects) {
            let object = objects[objectName];
            if (object) {
                let property: T = <T>object[propertyName];
                if (property !== undefined) {
                    return property;
                }
            }
        }
        return defaultValue;
    }




    export function getCategoricalObjectValue<T>(category: DataViewCategoryColumn, index: number, objectName: string, propertyName: string, defaultValue: T): T {
        let categoryObjects = category.objects;

        if (categoryObjects) {
            let categoryObject: DataViewObject = categoryObjects[index];
            if (categoryObject) {
                let object = categoryObject[objectName];
                if (object) {
                    let property: T = <T>object[propertyName];
                    if (property !== undefined) {
                        return property;
                    }
                }
            }
        }
        return defaultValue;
    }



    "use strict";
    export class Visual implements IVisual {


        private rootElement: JQuery;
        private dataView: DataView;
        private username: String; 


        constructor(options: VisualConstructorOptions) {
            this.rootElement = $(options.element);
        }

        public update(options: VisualUpdateOptions) {
            this.dataView = options.dataViews[0];

            this.rootElement.empty();


            if (this.dataView != null) {

                var defaultFontColor: Fill = { "solid": { "color": "darkblue" } };
                var defaultBackgroundColor: Fill = { "solid": { "color": "white" } };

                var propertyGroups: DataViewObjects = this.dataView.metadata.objects;
                var propertyGroupName: string = "greetUserProperties";
                var showName: boolean = getValue<boolean>(propertyGroups, propertyGroupName, "showName", true);
                var fontBold: string = getValue<boolean>(propertyGroups, propertyGroupName, "fontBold", true) ? "bold" : "normal";
                var fontColor: string = getValue<Fill>(propertyGroups, propertyGroupName, "fontColor", defaultFontColor).solid.color;
                var backgroundColor: string = getValue<Fill>(propertyGroups, propertyGroupName, "backgroundColor", defaultBackgroundColor).solid.color;;
                var fontType = getValue<string>(this.dataView.metadata.objects, propertyGroupName, "fontType", "arial");
                var fontSize = getValue<number>(this.dataView.metadata.objects, propertyGroupName, "fontSize", 18);


                var value: string = <string>this.dataView.single.value;
                var column: DataViewMetadataColumn = this.dataView.metadata.columns[0];
                var valueName: string = column.displayName
                var valueFormat: string = column.format;


                var valueFormatterFactory = powerbi.extensibility.utils.formatting.valueFormatter;
                var valueFormatter = valueFormatterFactory.create({
                    format: valueFormat,
                    formatSingleValues: true
                });


                let name = value.toString();
                let indexDot = name.indexOf(".");
                let indexa = name.indexOf("@");
                if(indexDot < indexa)
                    this.username = name.substr(0, indexDot);
                else
                    this.username = name.substr(0, indexa)



                var valueString: string = valueFormatter.format(this.username);

                var outputString: string = valueString;
                if (showName) {
                    outputString =  outputString;
                }


                var outputDiv = $("<div>")
                    .text(outputString)
                    .css({
                        "display": "table-cell",
                        "text-align": "center",
                        "vertical-align": "middle",
                        "text-wrap": "none",
                        "width": options.viewport.width,
                        "height": options.viewport.height,
                        "padding": "12px",
                        "font-weight": fontBold,
                        "color": fontColor,
                        "background-color": backgroundColor,
                        "font-size": fontSize,
                        "font-family" : fontType
                    });

                this.rootElement.append(outputDiv);
            }

            else {
                this.rootElement.append($("<div>")
                    .text("Please add a measure")
                    .css({
                        "display": "table-cell",
                        "text-align": "center",
                        "vertical-align": "middle",
                        "text-wrap": "none",
                        "width": options.viewport.width,
                        "height": options.viewport.height,
                        "padding": "12px",
                        "color": "red"
                    }));
            }

        }

      

        

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {

            console.log(options.objectName);

            let objectName: string = options.objectName;
            let objectEnumeration: VisualObjectInstance[] = [];

            switch (objectName) {
                case 'greetUserProperties':
                    objectEnumeration.push({
                        objectName: objectName,
                        displayName: objectName,
                        properties: {
                            showName: getValue<boolean>(this.dataView.metadata.objects, objectName, "showName", true),
                            fontBold: getValue<boolean>(this.dataView.metadata.objects, objectName, "fontBold", true),
                            fontColor: getValue<Fill>(this.dataView.metadata.objects, objectName, "fontColor", { "solid": { "color": "blue" } }),
                            backgroundColor: getValue<Fill>(this.dataView.metadata.objects, objectName, "backgroundColor", { "solid": { "color": "white" } }),
                            fontType: getValue<string>(this.dataView.metadata.objects, objectName, "fontType", "arial"),
                            fontSize: getValue<number>(this.dataView.metadata.objects, objectName, "fontSize", 18)
                        },
                        validValues: {
                            fontSize: { numberRange: { min: 10, max: 72 } }
                        }
                        ,
                        selector: null
                    });
                    break;
            };

            return objectEnumeration;
        }
    }
}